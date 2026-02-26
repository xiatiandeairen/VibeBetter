import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info, metric } from '../utils/display.js';

function trendArrow(values: number[]): string {
  if (values.length < 2) return pc.dim('—');
  const last = values[values.length - 1]!;
  const prev = values[values.length - 2]!;
  const delta = last - prev;
  if (Math.abs(delta) < 0.001) return pc.dim('→');
  return delta > 0 ? pc.red('↑') : pc.green('↓');
}

function trendSummary(values: number[]): string {
  if (values.length < 2) return 'insufficient data';
  const first = values[0]!;
  const last = values[values.length - 1]!;
  const change = last - first;
  const pct = first !== 0 ? ((change / Math.abs(first)) * 100).toFixed(1) : '∞';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(3)} (${sign}${pct}%)`;
}

export const trendsCommand = new Command('trends')
  .description('Show metric trend arrows over last 5 snapshots')
  .option('-n, --count <number>', 'Number of snapshots', '5')
  .action(async (opts) => {
    header('Metric Trends');
    const config = requireConfig();
    const client = new ApiClient(config);
    const limit = parseInt(opts.count, 10) || 5;

    const snapshots = await client.getSnapshots(limit).catch(() => null);
    if (!snapshots || snapshots.length === 0) {
      info('No snapshot history available. Run: vibe sync');
      return;
    }

    const psriValues = snapshots.map((s) => s.psriScore ?? 0);
    const tdiValues = snapshots.map((s) => s.tdiScore ?? 0);
    const aiValues = snapshots.map((s) => s.aiSuccessRate ?? 0);

    console.log(pc.bold('  Trends\n'));
    console.log(`  ${pc.dim('PSRI'.padEnd(20))} ${psriValues.map((v) => v.toFixed(3)).join(' → ')}  ${trendArrow(psriValues)}`);
    console.log(`  ${pc.dim('TDI'.padEnd(20))} ${tdiValues.map((v) => v.toFixed(3)).join(' → ')}  ${trendArrow(tdiValues)}`);
    console.log(`  ${pc.dim('AI Success'.padEnd(20))} ${aiValues.map((v) => `${(v * 100).toFixed(1)}%`).join(' → ')}  ${trendArrow(aiValues)}`);
    console.log();

    console.log(pc.bold('  Net Change\n'));
    metric('PSRI', trendSummary(psriValues));
    metric('TDI', trendSummary(tdiValues));
    metric('AI Success', trendSummary(aiValues));
    console.log();
    console.log(pc.dim(`  Based on ${snapshots.length} snapshots`));
    console.log();
  });
