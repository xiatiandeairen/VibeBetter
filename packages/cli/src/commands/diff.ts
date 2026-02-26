import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric } from '../utils/display.js';

export const diffCommand = new Command('diff')
  .description('Compare metrics between snapshots')
  .option('--snapshots <n>', 'Compare latest with N-th previous', '2')
  .action(async (opts: { snapshots: string }) => {
    header('Metric Diff');
    const config = requireConfig();
    const client = new ApiClient(config);
    const n = parseInt(opts.snapshots);
    const snapshots = await client.getSnapshots(n);

    if (snapshots.length < 2) {
      console.log('  Not enough snapshots for comparison');
      return;
    }

    const latest = snapshots[0]!;
    const previous = snapshots[snapshots.length - 1]!;

    console.log(`  Comparing: ${pc.dim(latest.snapshotDate.split('T')[0])} vs ${pc.dim(previous.snapshotDate.split('T')[0])}`);
    console.log();

    function showDiff(label: string, curr: number | null, prev: number | null, inverted = false): void {
      if (curr === null || prev === null) { metric(label, 'N/A'); return; }
      const delta = curr - prev;
      const pct = prev !== 0 ? ((delta / Math.abs(prev)) * 100).toFixed(1) : '∞';
      const improved = inverted ? delta < 0 : delta > 0;
      const color = improved ? 'green' : delta === 0 ? undefined : 'red';
      const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
      metric(label, `${curr.toFixed(3)} ${arrow} ${pct}%`, color as 'green' | 'red' | undefined);
    }

    showDiff('AI Success Rate', latest.aiSuccessRate, previous.aiSuccessRate);
    showDiff('AI Stable Rate', latest.aiStableRate, previous.aiStableRate);
    showDiff('PSRI Score', latest.psriScore, previous.psriScore, true);
    showDiff('TDI Score', latest.tdiScore, previous.tdiScore, true);
  });
