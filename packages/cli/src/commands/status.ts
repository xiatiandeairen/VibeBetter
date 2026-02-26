import { Command } from 'commander';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, success, error, metric } from '../utils/display.js';
import { getCurrentBranch } from '../utils/git.js';

export const statusCommand = new Command('status')
  .description('Show connection status and project info')
  .action(async () => {
    header('Status');
    const config = requireConfig();
    const client = new ApiClient(config);
    try {
      const healthy = await client.healthCheck();
      if (healthy) success('API connected');
      else error('API unreachable');
      metric('API URL', config.apiUrl);
      metric('Project ID', config.projectId);
      const branch = await getCurrentBranch().catch(() => 'unknown');
      metric('Git Branch', branch);
    } catch (err) {
      error(`Status check failed: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  });
