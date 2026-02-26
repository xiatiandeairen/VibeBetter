import { Command } from 'commander';
import pc from 'picocolors';
import { header } from '../utils/display.js';

interface Shortcut {
  command: string;
  alias: string;
  description: string;
}

const SHORTCUTS: Shortcut[] = [
  { command: 'vibe check', alias: 'vibe c', description: 'Run pre-commit risk check' },
  { command: 'vibe status', alias: 'vibe s', description: 'Show project status' },
  { command: 'vibe risk', alias: 'vibe r', description: 'View risk trends' },
  { command: 'vibe sync', alias: 'vibe sy', description: 'Sync data from remote' },
  { command: 'vibe analyze', alias: 'vibe a', description: 'Run offline analysis' },
  { command: 'vibe report', alias: 'vibe rp', description: 'Generate report' },
  { command: 'vibe insights', alias: 'vibe i', description: 'View AI insights' },
  { command: 'vibe decisions', alias: 'vibe d', description: 'View decisions' },
  { command: 'vibe dashboard', alias: 'vibe db', description: 'Open TUI dashboard' },
  { command: 'vibe health', alias: 'vibe h', description: 'Project health check' },
  { command: 'vibe quick', alias: 'vibe q', description: 'Quick status summary' },
  { command: 'vibe diff', alias: 'vibe df', description: 'Snapshot comparison' },
  { command: 'vibe fix', alias: 'vibe f', description: 'Show fix suggestions' },
  { command: 'vibe top', alias: 'vibe t', description: 'Top risk files' },
  { command: 'vibe explain', alias: 'vibe e', description: 'Explain a metric' },
  { command: 'vibe history', alias: 'vibe hi', description: 'Metric history' },
  { command: 'vibe doctor', alias: 'vibe doc', description: 'Diagnose setup issues' },
  { command: 'vibe summary', alias: 'vibe sum', description: 'Full summary' },
  { command: 'vibe scorecard', alias: 'vibe sc', description: 'Project scorecard' },
  { command: 'vibe forecast', alias: 'vibe fc', description: 'Metric forecast' },
];

export const shortcutsCommand = new Command('shortcuts')
  .description('Show all available command shortcuts and aliases')
  .option('--json', 'Output as JSON')
  .option('--filter <text>', 'Filter shortcuts by keyword')
  .action(async (opts) => {
    header('VibeBetter Shortcuts');

    let items = SHORTCUTS;
    if (opts.filter) {
      const lower = opts.filter.toLowerCase();
      items = items.filter(
        (s) =>
          s.command.toLowerCase().includes(lower) ||
          s.alias.toLowerCase().includes(lower) ||
          s.description.toLowerCase().includes(lower)
      );
    }

    if (opts.json) {
      console.log(JSON.stringify(items, null, 2));
      return;
    }

    if (items.length === 0) {
      console.log(pc.dim('  No shortcuts match your filter.'));
      return;
    }

    console.log();
    console.log(`  ${pc.dim('COMMAND'.padEnd(22))} ${pc.dim('SHORTCUT'.padEnd(14))} ${pc.dim('DESCRIPTION')}`);
    console.log(`  ${pc.dim('\u2500'.repeat(60))}`);

    for (const s of items) {
      console.log(
        `  ${pc.cyan(s.command.padEnd(22))} ${pc.bold(s.alias.padEnd(14))} ${pc.dim(s.description)}`
      );
    }

    console.log();
    console.log(pc.dim(`  ${items.length} shortcut(s) available`));
    console.log();
  });
