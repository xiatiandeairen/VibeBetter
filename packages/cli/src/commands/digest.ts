import { Command } from 'commander';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, success, metric, benchmarkColor } from '../utils/display.js';

export const digestCommand = new Command('digest')
  .description('Weekly digest — summarize last 7 days of activity')
  .action(async () => {
    header('Weekly Digest');
    const config = requireConfig();
    const client = new ApiClient(config);

    try {
      const digest = await client.getDigest();

      console.log(`  Period: ${digest.period.from.slice(0, 10)} → ${digest.period.to.slice(0, 10)}`);
      console.log(`  Snapshots: ${digest.snapshotCount}`);
      console.log();

      if (digest.metrics.aiSuccessRate !== null) {
        metric('AI Success Rate', `${(digest.metrics.aiSuccessRate * 100).toFixed(1)}%`, benchmarkColor('aiSuccessRate', digest.metrics.aiSuccessRate));
      }
      if (digest.metrics.psriScore !== null) {
        metric('PSRI Score', digest.metrics.psriScore.toFixed(3), benchmarkColor('psriScore', digest.metrics.psriScore));
      }
      if (digest.metrics.tdiScore !== null) {
        metric('TDI Score', digest.metrics.tdiScore.toFixed(3), benchmarkColor('tdiScore', digest.metrics.tdiScore));
      }

      console.log();
      metric('PRs this week', digest.activity.prsThisWeek);
      metric('AI PRs this week', digest.activity.aiPrsThisWeek);

      if (digest.trends.psriChange !== 0) {
        const dir = digest.trends.psriChange > 0 ? '↑' : '↓';
        metric('PSRI trend', `${dir} ${Math.abs(digest.trends.psriChange).toFixed(3)}`);
      }

      console.log();
      success('Weekly digest complete.');
    } catch (err) {
      console.error(`Digest failed: ${err instanceof Error ? err.message : 'Unknown'}`);
      process.exit(1);
    }
  });
