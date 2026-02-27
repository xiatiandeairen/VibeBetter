import { Command } from 'commander';
import pc from 'picocolors';
import simpleGit from 'simple-git';
import { readFileSync, existsSync } from 'fs';
import { header, success, warn, metric } from '../utils/display.js';

export const scanCommand = new Command('scan')
  .description('Analyze current state — changed files, risk, coverage gaps')
  .action(async () => {
    header('Scan');
    const git = simpleGit();
    const status = await git.status();
    const branch = (await git.branch()).current;

    const allChanged = [
      ...new Set([...status.modified, ...status.staged, ...status.created, ...status.not_added]),
    ];
    const tsFiles = allChanged.filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'));

    metric('Branch', branch);
    metric('Changed files', allChanged.length);
    metric('TypeScript files', tsFiles.length);
    metric('Staged', status.staged.length);
    metric('Unstaged', status.modified.length);
    metric('Untracked', status.not_added.length);

    if (tsFiles.length === 0) {
      console.log();
      success('Clean state — no TypeScript changes');
      return;
    }

    console.log(pc.bold('\n  Changed Files:'));
    for (const file of tsFiles.slice(0, 15)) {
      const staged = status.staged.includes(file);
      const prefix = staged ? pc.green('staged') : pc.yellow('modified');

      let risk = 'LOW';
      let riskColor = pc.green;
      if (existsSync(file)) {
        const content = readFileSync(file, 'utf-8');
        const lines = content.split('\n').length;
        const hasAny = /:\s*any\b/.test(content);
        const hasConsole = /console\.(log|debug)/.test(content);
        if (lines > 200 || hasAny) {
          risk = 'HIGH';
          riskColor = pc.red;
        } else if (lines > 150 || hasConsole) {
          risk = 'MED';
          riskColor = pc.yellow;
        }
      }

      console.log(`  ${prefix.padEnd(18)} ${riskColor(risk.padEnd(6))} ${pc.white(file)}`);
    }

    const changedWithoutTests = tsFiles.filter((f) => {
      if (f.includes('.test.')) return false;
      const testFile = f.replace('.ts', '.test.ts').replace('.tsx', '.test.tsx');
      return !existsSync(testFile) && !tsFiles.includes(testFile);
    });

    if (changedWithoutTests.length > 0) {
      console.log(pc.bold('\n  Missing Tests:'));
      for (const f of changedWithoutTests.slice(0, 5)) {
        console.log(`  ${pc.yellow('⚠')} ${pc.dim(f)} — no corresponding .test.ts`);
      }
    }

    console.log();
    if (status.staged.length > 0) {
      console.log(pc.dim('  Next: `vibe guard` to check quality before commit'));
    } else {
      console.log(pc.dim('  Next: `vibe prompt "<task>"` to generate AI prompt'));
    }
  });
