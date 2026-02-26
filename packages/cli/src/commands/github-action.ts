import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { header, info, success } from '../utils/display.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

function generateWorkflow(threshold: string, cron: string): string {
  return `name: VibeBetter Analysis

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '${cron}'
  workflow_dispatch:

permissions:
  contents: read
  pull-requests: write

jobs:
  vibebetter:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install VibeBetter CLI
        run: npm install -g vibebetter-cli

      - name: Run analysis
        run: vibe ci --threshold ${threshold} --json > vibebetter-report.json
        env:
          VIBEBETTER_API_KEY: \${{ secrets.VIBEBETTER_API_KEY }}
          VIBEBETTER_PROJECT_ID: \${{ secrets.VIBEBETTER_PROJECT_ID }}

      - name: Upload report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: vibebetter-report
          path: vibebetter-report.json

      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('vibebetter-report.json', 'utf8'));
            const psri = report.psri?.toFixed(3) ?? 'N/A';
            const status = report.passed ? '✅ Passed' : '❌ Failed';
            const body = \`## VibeBetter Report\\n\\n| Metric | Value |\\n|--------|-------|\\n| PSRI | \${psri} |\\n| Status | \${status} |\\n\`;
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body,
            });
`;
}

export const githubActionCommand = new Command('github-action')
  .description('Generate GitHub Action workflow YAML for VibeBetter')
  .option('--threshold <n>', 'PSRI failure threshold', '0.6')
  .option('--cron <expr>', 'Schedule cron expression', '0 9 * * 1')
  .option('--stdout', 'Print to stdout instead of writing file')
  .action(async (opts) => {
    header('GitHub Action Generator');
    requireConfig();

    const yaml = generateWorkflow(opts.threshold, opts.cron);

    if (opts.stdout) {
      console.log(yaml);
      return;
    }

    const dir = path.resolve(process.cwd(), '.github', 'workflows');
    const filePath = path.join(dir, 'vibebetter.yml');

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, yaml, 'utf-8');
    success(`Wrote ${filePath}`);
    console.log();
    info('Add VIBEBETTER_API_KEY and VIBEBETTER_PROJECT_ID to your repo secrets.');
    console.log();
  });
