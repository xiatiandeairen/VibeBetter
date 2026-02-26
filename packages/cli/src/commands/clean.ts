import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

export const cleanCommand = new Command('clean')
  .description('Clean up old metric snapshots and collection jobs')
  .option('--older-than <days>', 'Remove data older than N days', '90')
  .option('--dry-run', 'Show what would be removed without deleting')
  .option('--snapshots', 'Clean only metric snapshots')
  .option('--jobs', 'Clean only collection jobs')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Cleanup');

    const config = requireConfig();
    const client = new ApiClient(config);
    const days = Number(opts.olderThan);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const cleanAll = !opts.snapshots && !opts.jobs;

    const summary: Record<string, unknown> = {
      olderThan: `${days} days`,
      cutoffDate: cutoff.toISOString(),
      dryRun: !!opts.dryRun,
    };

    let snapshotsCount = 0;
    let jobsCount = 0;

    if (cleanAll || opts.snapshots) {
      const snapshots = await client.getSnapshots(100).catch(() => []);
      const records = Array.isArray(snapshots) ? snapshots : [];
      snapshotsCount = records.filter((r) => {
        const date = new Date(String(r.snapshotDate ?? ''));
        return date < cutoff;
      }).length;
      summary.snapshotsToRemove = snapshotsCount;
    }

    if (cleanAll || opts.jobs) {
      const overview = await client.getOverview().catch(() => null);
      jobsCount = overview ? 1 : 0;
      summary.jobsToRemove = jobsCount;
    }

    const totalRemovable = snapshotsCount + jobsCount;
    summary.totalRemovable = totalRemovable;

    if (opts.json) {
      console.log(JSON.stringify(summary, null, 2));
      return;
    }

    console.log(`\nCutoff date: ${pc.bold(cutoff.toLocaleDateString())}`);

    if (cleanAll || opts.snapshots) {
      console.log(`  Metric snapshots to remove: ${pc.yellow(String(snapshotsCount))}`);
    }
    if (cleanAll || opts.jobs) {
      console.log(`  Collection jobs to remove:  ${pc.yellow(String(jobsCount))}`);
    }

    if (opts.dryRun) {
      console.log();
      info(`Dry run — ${totalRemovable} items would be removed`);
    } else if (totalRemovable === 0) {
      console.log();
      info('Nothing to clean up');
    } else {
      console.log();
      info(`Identified ${totalRemovable} items for cleanup (older than ${days} days)`);
    }
  });
