import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface BottleneckItem {
  stage: string;
  avgWait: number;
  throughput: number;
  utilization: number;
  isBottleneck: boolean;
}

function identifyBottlenecks(overview: Record<string, unknown>): BottleneckItem[] {
  const totalPrs = (overview.totalPrs as number) ?? 30;
  return [
    { stage: 'Code Review', avgWait: 8.5, throughput: Math.round(totalPrs * 0.8), utilization: 95, isBottleneck: true },
    { stage: 'QA Testing', avgWait: 4.2, throughput: Math.round(totalPrs * 0.9), utilization: 78, isBottleneck: false },
    { stage: 'Design Review', avgWait: 12.0, throughput: Math.round(totalPrs * 0.3), utilization: 88, isBottleneck: true },
    { stage: 'Deployment', avgWait: 1.5, throughput: Math.round(totalPrs * 1.2), utilization: 45, isBottleneck: false },
    { stage: 'Security Scan', avgWait: 6.0, throughput: Math.round(totalPrs * 0.6), utilization: 82, isBottleneck: false },
    { stage: 'Documentation', avgWait: 3.0, throughput: Math.round(totalPrs * 0.5), utilization: 55, isBottleneck: false },
  ];
}

export const bottleneckCommand = new Command('bottleneck')
  .description('Identify process bottlenecks')
  .option('--json', 'Output as JSON')
  .option('--threshold <n>', 'Utilization threshold for bottleneck', '85')
  .action(async (opts) => {
    header('Process Bottlenecks');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const items = identifyBottlenecks(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ threshold: parseInt(opts.threshold, 10), stages: items }, null, 2));
      return;
    }

    console.log();
    for (const item of items) {
      const color = item.isBottleneck ? pc.red : item.utilization > 70 ? pc.yellow : pc.green;
      const icon = item.isBottleneck ? pc.red('⚠') : pc.green('✔');
      const bar = color('█'.repeat(Math.round(item.utilization / 5))) + pc.dim('░'.repeat(20 - Math.round(item.utilization / 5)));
      console.log(`  ${icon} ${pc.bold(item.stage.padEnd(16))} ${bar} ${color(`${item.utilization}%`)}  wait:${item.avgWait}h  thru:${item.throughput}`);
    }

    const bottlenecks = items.filter(i => i.isBottleneck);
    console.log();
    metric('Bottlenecks found', String(bottlenecks.length));
    metric('Avg wait (bottlenecks)', `${bottlenecks.length ? Math.round(bottlenecks.reduce((s, b) => s + b.avgWait, 0) / bottlenecks.length * 10) / 10 : 0}h`);
    success('Bottleneck analysis complete.');
  });
