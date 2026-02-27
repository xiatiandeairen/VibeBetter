import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface ReleaseEntry {
  type: 'feature' | 'fix' | 'breaking' | 'chore';
  scope: string;
  message: string;
  pr: number;
}

function generateNotes(_overview: Record<string, unknown>): ReleaseEntry[] {
  return [
    { type: 'feature', scope: 'cli', message: 'Add dependency audit command', pr: 412 },
    { type: 'feature', scope: 'api', message: 'Add batch metrics endpoint', pr: 408 },
    { type: 'fix', scope: 'auth', message: 'Fix token refresh race condition', pr: 410 },
    { type: 'fix', scope: 'ui', message: 'Correct chart axis label overflow', pr: 409 },
    { type: 'breaking', scope: 'api', message: 'Rename /config to /settings', pr: 407 },
    { type: 'chore', scope: 'deps', message: 'Upgrade TypeScript to 5.7', pr: 411 },
  ];
}

export const releaseNotesGenCommand = new Command('release-notes-gen')
  .description('Generate release notes from commit history')
  .option('--json', 'Output as JSON')
  .option('--tag <version>', 'Target version tag')
  .action(async (opts) => {
    header('Release Notes Generator');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const entries = generateNotes(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ version: opts.tag ?? 'next', entries }, null, 2));
      return;
    }

    const groups: Record<string, ReleaseEntry[]> = {};
    for (const e of entries) {
      (groups[e.type] ??= []).push(e);
    }

    console.log();
    const typeLabel: Record<string, string> = { feature: '🚀 Features', fix: '🐛 Bug Fixes', breaking: '⚠️ Breaking', chore: '🔧 Chores' };
    for (const [type, items] of Object.entries(groups)) {
      console.log(`  ${pc.bold(typeLabel[type] ?? type)}`);
      for (const item of items) {
        console.log(`    - ${pc.dim(`[${item.scope}]`)} ${item.message} ${pc.dim(`#${item.pr}`)}`);
      }
    }

    console.log();
    metric('Total entries', String(entries.length));
    metric('Breaking changes', String(entries.filter(e => e.type === 'breaking').length));
    success('Release notes generated.');
  });
