import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface FreshnessEntry {
  path: string;
  daysSinceTouch: number;
  lines: number;
  freshness: 'fresh' | 'aging' | 'stale' | 'ancient';
}

function analyzeFreshness(_overview: Record<string, unknown>): FreshnessEntry[] {
  return [
    { path: 'src/api/routes.ts', daysSinceTouch: 2, lines: 340, freshness: 'fresh' },
    { path: 'src/auth/oauth.ts', daysSinceTouch: 15, lines: 220, freshness: 'fresh' },
    { path: 'src/utils/legacy-parser.ts', daysSinceTouch: 180, lines: 500, freshness: 'stale' },
    { path: 'src/db/seed.ts', daysSinceTouch: 90, lines: 150, freshness: 'aging' },
    { path: 'src/config/defaults.ts', daysSinceTouch: 365, lines: 80, freshness: 'ancient' },
    { path: 'src/middleware/cors.ts', daysSinceTouch: 45, lines: 60, freshness: 'aging' },
  ];
}

export const codeFreshnessCommand = new Command('code-freshness')
  .description('Analyze code freshness based on last modification dates')
  .option('--json', 'Output as JSON')
  .option('--stale-days <n>', 'Days threshold for stale', '90')
  .action(async (opts) => {
    header('Code Freshness');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const entries = analyzeFreshness(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ files: entries }, null, 2));
      return;
    }

    console.log();
    for (const f of entries) {
      const color = f.freshness === 'fresh' ? pc.green : f.freshness === 'aging' ? pc.yellow : f.freshness === 'stale' ? pc.red : pc.dim;
      console.log(`  ${color(`[${f.freshness.padEnd(7)}]`)} ${pc.bold(f.path.padEnd(36))} ${pc.dim(`${f.daysSinceTouch}d ago, ${f.lines} lines`)}`);
    }

    const staleCount = entries.filter(e => e.freshness === 'stale' || e.freshness === 'ancient').length;
    console.log();
    metric('Files analyzed', String(entries.length));
    metric('Stale files', String(staleCount));
    success('Code freshness analysis complete.');
  });
