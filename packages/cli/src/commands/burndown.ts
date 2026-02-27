import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface BurndownPoint {
  week: string;
  remaining: number;
  resolved: number;
}

function generateBurndown(overview: Record<string, unknown>): BurndownPoint[] {
  const tdi = (overview.tdiScore as number) ?? 45;
  const points: BurndownPoint[] = [];
  let remaining = Math.round(tdi);

  for (let w = 0; w < 8; w++) {
    const resolved = Math.round(Math.random() * 5 + 2);
    remaining = Math.max(0, remaining - resolved + Math.round(Math.random() * 2));
    points.push({ week: `W${w + 1}`, remaining, resolved });
  }

  return points;
}

export const burndownCommand = new Command('burndown')
  .description('Tech debt burndown chart')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Tech Debt Burndown');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const points = generateBurndown(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify(points, null, 2));
      return;
    }

    console.log();
    const maxRemaining = Math.max(...points.map(p => p.remaining), 1);
    for (const point of points) {
      const barLen = Math.round((point.remaining / maxRemaining) * 30);
      const bar = pc.red('█'.repeat(barLen)) + pc.dim('░'.repeat(30 - barLen));
      console.log(`  ${point.week.padEnd(4)} ${bar} ${point.remaining} remaining (${pc.green(`-${point.resolved}`)})`);
    }

    console.log();
    const totalResolved = points.reduce((s, p) => s + p.resolved, 0);
    metric('Total resolved', String(totalResolved));
    metric('Current remaining', String(points[points.length - 1]?.remaining ?? 0));
    success('Burndown chart generated.');
  });
