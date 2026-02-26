import { Command } from 'commander';
import { saveConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { success, error, header } from '../utils/display.js';

export const initCommand = new Command('init')
  .description('Initialize VibeBetter CLI configuration')
  .requiredOption('--api-url <url>', 'VibeBetter API URL')
  .requiredOption('--api-key <key>', 'API Key for authentication')
  .requiredOption('--project <id>', 'Project ID to track')
  .action(async (opts: { apiUrl: string; apiKey: string; project: string }) => {
    header('Initializing');
    const config = { apiUrl: opts.apiUrl, apiKey: opts.apiKey, projectId: opts.project };
    const client = new ApiClient(config);
    try {
      const healthy = await client.healthCheck();
      if (!healthy) { error('Cannot connect to API'); process.exit(1); }
      saveConfig(config);
      success(`Connected to ${opts.apiUrl}`);
      success(`Project: ${opts.project}`);
      success('Config saved to ~/.vibebetter/config.json');
    } catch (err) {
      error(`Init failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      process.exit(1);
    }
  });
