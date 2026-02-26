import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric } from '../utils/display.js';

export const diffFilesCommand = new Command('diff-files')
  .description('Show risk diff for specific files between snapshots')
  .argument('<files...>', 'File paths to compare')
  .option('--snapshots <n>', 'Compare latest with N-th previous', '2')
  .option('--json', 'Output as JSON')
  .action(async (files: string[], opts) => {
    header('File Risk Diff');
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

    interface FileDiff {
      file: string;
      latestRisk: number | null;
      previousRisk: number | null;
      delta: number | null;
      direction: string;
    }

    const diffs: FileDiff[] = files.map((file) => {
      const latestRisk = (latest as Record<string, unknown>)[file] as number | undefined ?? null;
      const previousRisk = (previous as Record<string, unknown>)[file] as number | undefined ?? null;
      const delta = latestRisk !== null && previousRisk !== null ? latestRisk - previousRisk : null;
      const direction = delta === null ? '?' : delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
      return { file, latestRisk, previousRisk, delta, direction };
    });

    if (opts.json) {
      console.log(JSON.stringify(diffs, null, 2));
      return;
    }

    console.log(`  Comparing: ${pc.dim(latest.snapshotDate.split('T')[0])} vs ${pc.dim(previous.snapshotDate.split('T')[0])}`);
    console.log();

    for (const d of diffs) {
      const color = d.delta === null ? undefined : d.delta > 0 ? 'red' : d.delta < 0 ? 'green' : undefined;
      const value = d.delta !== null ? `${d.previousRisk} → ${d.latestRisk} (${d.direction} ${Math.abs(d.delta).toFixed(2)})` : 'N/A';
      metric(d.file, value, color as 'green' | 'red' | undefined);
    }

    console.log();
  });
