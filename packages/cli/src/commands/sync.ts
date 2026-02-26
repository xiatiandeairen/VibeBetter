import { Command } from 'commander';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, success, info, error } from '../utils/display.js';

export const syncCommand = new Command('sync')
  .description('Trigger data collection and metric computation')
  .action(async () => {
    header('Syncing');
    const config = requireConfig();
    const client = new ApiClient(config);

    try {
      info('Triggering data collection...');
      await client.triggerCollection();
      success('Collection job queued');

      info('Computing metrics...');
      await client.triggerCompute();
      success('Metrics computed');

      info('Done! Run `vibe insights` to see updated metrics.');
    } catch (err) {
      error(`Sync failed: ${err instanceof Error ? err.message : 'Unknown'}`);
      process.exit(1);
    }
  });
