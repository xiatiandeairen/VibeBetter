import { Command } from 'commander';
import simpleGit from 'simple-git';
import { saveConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { success, error, info, header } from '../utils/display.js';

export const initCommand = new Command('init')
  .description('Initialize VibeBetter CLI configuration')
  .requiredOption('--api-url <url>', 'VibeBetter API URL')
  .requiredOption('--api-key <key>', 'API Key for authentication')
  .option('--project <id>', 'Project ID to track')
  .option('--auto', 'Auto-detect project from git remote')
  .action(async (opts: { apiUrl: string; apiKey: string; project?: string; auto?: boolean }) => {
    header('Initializing');

    let projectId = opts.project;

    if (opts.auto && !projectId) {
      const git = simpleGit();
      const remotes = await git.getRemotes(true);
      const origin = remotes.find(r => r.name === 'origin');
      if (origin?.refs.fetch) {
        info(`Detected remote: ${origin.refs.fetch}`);
        projectId = origin.refs.fetch
          .replace(/^.*github\.com[:/]/, '')
          .replace(/\.git$/, '');
        info(`Auto-detected project slug: ${projectId}`);
      } else {
        error('No origin remote found. Please specify --project <id>');
        process.exit(1);
      }
    }

    if (!projectId) {
      error('Please specify --project <id> or use --auto to detect from git remote');
      process.exit(1);
    }

    const config = { apiUrl: opts.apiUrl, apiKey: opts.apiKey, projectId };
    const client = new ApiClient(config);
    try {
      const healthy = await client.healthCheck();
      if (!healthy) { error('Cannot connect to API'); process.exit(1); }
      saveConfig(config);
      success(`Connected to ${opts.apiUrl}`);
      success(`Project: ${projectId}`);
      success('Config saved to ~/.vibebetter/config.json');
    } catch (err) {
      error(`Init failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      process.exit(1);
    }
  });
