import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

const SPARK_CHARS = '▁▂▃▄▅▆▇█';

function sparkline(values: number[]): string {
  if (values.length === 0) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values
    .map((v) => {
      const idx = Math.round(((v - min) / range) * (SPARK_CHARS.length - 1));
      return SPARK_CHARS[idx];
    })
    .join('');
}

export const historyCommand = new Command('history')
  .description('Show metric history as sparkline')
  .option('-n, --count <number>', 'Number of snapshots', '10')
  .action(async (opts) => {
    header('Metric History');
    const config = requireConfig();
    const client = new ApiClient(config);
    const limit = parseInt(opts.count, 10) || 10;

    const snapshots = await client.getSnapshots(limit).catch(() => null);
    if (!snapshots || snapshots.length === 0) {
      info('No snapshot history available. Run: vibe sync');
      return;
    }

    const psriValues = snapshots.map((s) => s.psriScore ?? 0);
    const tdiValues = snapshots.map((s) => s.tdiScore ?? 0);
    const aiValues = snapshots.map((s) => s.aiSuccessRate ?? 0);

    const pad = (label: string) => label.padEnd(18);

    console.log(pc.bold('  Sparkline History\n'));
    console.log(`  ${pc.dim(pad('PSRI'))} ${sparkline(psriValues)}  ${pc.dim(`latest: ${psriValues[psriValues.length - 1]?.toFixed(3)}`)}`);
    console.log(`  ${pc.dim(pad('TDI'))} ${sparkline(tdiValues)}  ${pc.dim(`latest: ${tdiValues[tdiValues.length - 1]?.toFixed(3)}`)}`);
    const latestAi = aiValues[aiValues.length - 1] ?? 0;
    console.log(`  ${pc.dim(pad('AI Success Rate'))} ${sparkline(aiValues)}  ${pc.dim(`latest: ${(latestAi * 100).toFixed(1)}%`)}`);
    console.log();
    const first = snapshots[0]?.snapshotDate?.slice(0, 10) ?? '';
    const last = snapshots[snapshots.length - 1]?.snapshotDate?.slice(0, 10) ?? '';
    console.log(pc.dim(`  ${snapshots.length} snapshots: ${first} → ${last}`));
    console.log();
  });
