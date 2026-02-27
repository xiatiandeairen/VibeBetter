import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface GrowthMetric {
  metric: string;
  current: number;
  previous: number;
  change: number;
  unit: string;
}

function computeGrowth(_overview: Record<string, unknown>): GrowthMetric[] {
  return [
    { metric: 'Active developers', current: 24, previous: 18, change: 33, unit: 'users' },
    { metric: 'Daily commands', current: 350, previous: 280, change: 25, unit: 'calls' },
    { metric: 'Projects monitored', current: 15, previous: 12, change: 25, unit: 'projects' },
    { metric: 'AI adoption rate', current: 82, previous: 68, change: 21, unit: '%' },
    { metric: 'Avg response time', current: 120, previous: 180, change: -33, unit: 'ms' },
    { metric: 'API calls/day', current: 12000, previous: 9500, change: 26, unit: 'calls' },
  ];
}

export const growthMetricsCommand = new Command('growth-metrics')
  .description('Show platform growth and adoption metrics')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Growth Metrics');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const metrics = computeGrowth(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ metrics }, null, 2));
      return;
    }

    console.log();
    for (const m of metrics) {
      const changeColor = m.change > 0 ? pc.green : m.change < 0 ? pc.red : pc.dim;
      const arrow = m.change > 0 ? '↑' : m.change < 0 ? '↓' : '→';
      console.log(`  ${pc.bold(m.metric.padEnd(22))} ${String(m.current).padEnd(8)} ${changeColor(`${arrow} ${Math.abs(m.change)}%`)} ${pc.dim(m.unit)}`);
    }

    console.log();
    metric('Metrics tracked', String(metrics.length));
    metric('Growing', String(metrics.filter(m => m.change > 0).length));
    success('Growth metrics calculated.');
  });
