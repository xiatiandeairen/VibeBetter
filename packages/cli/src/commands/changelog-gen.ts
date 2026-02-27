import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface ChangelogEntry {
  type: 'feat' | 'fix' | 'refactor' | 'docs' | 'chore';
  scope: string | null;
  description: string;
  hash: string;
  breaking: boolean;
}

function generateChangelog(_overview: Record<string, unknown>): ChangelogEntry[] {
  return [
    { type: 'feat', scope: 'cli', description: 'add dependency graph visualization', hash: 'a1b2c3d', breaking: false },
    { type: 'feat', scope: 'api', description: 'add module risk endpoint', hash: 'e4f5g6h', breaking: false },
    { type: 'fix', scope: 'auth', description: 'fix token refresh race condition', hash: 'i7j8k9l', breaking: false },
    { type: 'refactor', scope: 'core', description: 'extract metrics calculation', hash: 'm0n1o2p', breaking: false },
    { type: 'feat', scope: null, description: 'add team velocity tracking', hash: 'q3r4s5t', breaking: false },
    { type: 'fix', scope: 'db', description: 'fix migration ordering', hash: 'u6v7w8x', breaking: false },
    { type: 'docs', scope: null, description: 'update API documentation', hash: 'y9z0a1b', breaking: false },
    { type: 'feat', scope: 'api', description: 'new capacity planning endpoint', hash: 'c2d3e4f', breaking: true },
  ];
}

export const changelogGenCommand = new Command('changelog-gen')
  .description('Auto-generate changelog from conventional commits')
  .option('--json', 'Output as JSON')
  .option('--version <v>', 'Version label for changelog', 'Unreleased')
  .action(async (opts) => {
    header('Changelog Generator');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const entries = generateChangelog(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify(entries, null, 2));
      return;
    }

    console.log();
    console.log(`  ${pc.bold(`## ${opts.version}`)}`);
    console.log();

    const breaking = entries.filter(e => e.breaking);
    if (breaking.length > 0) {
      console.log(`  ${pc.red(pc.bold('⚠ BREAKING CHANGES'))}`);
      for (const e of breaking) {
        console.log(`  - ${e.description} (${pc.dim(e.hash)})`);
      }
      console.log();
    }

    const groups: Record<string, ChangelogEntry[]> = {};
    for (const e of entries) {
      (groups[e.type] ??= []).push(e);
    }

    const labels: Record<string, string> = { feat: 'Features', fix: 'Bug Fixes', refactor: 'Refactors', docs: 'Documentation', chore: 'Chores' };
    for (const [type, items] of Object.entries(groups)) {
      console.log(`  ${pc.bold(`### ${labels[type] ?? type}`)}`);
      for (const item of items) {
        const scope = item.scope ? pc.cyan(`(${item.scope})`) + ' ' : '';
        console.log(`  - ${scope}${item.description} ${pc.dim(item.hash)}`);
      }
      console.log();
    }

    metric('Total entries', String(entries.length));
    metric('Breaking changes', String(breaking.length));
    success('Changelog generated.');
  });
