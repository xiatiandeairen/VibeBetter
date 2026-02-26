import { Command } from 'commander';
import pc from 'picocolors';
import { loadConfig, saveConfig } from '../config.js';
import { header, success, info, error } from '../utils/display.js';

export const configCommand = new Command('config')
  .description('View or edit VibeBetter CLI configuration')
  .option('--get <key>', 'Get a config value')
  .option('--set <key=value>', 'Set a config value')
  .option('--list', 'List all config values')
  .action(async (opts) => {
    header('Configuration');
    const config = loadConfig();

    if (opts.list || (!opts.get && !opts.set)) {
      if (!config) {
        info('No configuration found. Run: vibe init');
        return;
      }
      console.log(pc.bold('  Current configuration:\n'));
      console.log(`  ${pc.dim('apiUrl')}     ${config.apiUrl}`);
      console.log(`  ${pc.dim('apiKey')}     ${config.apiKey.slice(0, 8)}${'*'.repeat(8)}`);
      console.log(`  ${pc.dim('projectId')}  ${config.projectId}`);
      console.log();
      return;
    }

    if (opts.get) {
      if (!config) { error('No configuration found.'); return; }
      const key = opts.get as keyof typeof config;
      if (key in config) {
        console.log(`  ${key} = ${config[key]}`);
      } else {
        error(`Unknown key: ${key}`);
      }
      return;
    }

    if (opts.set) {
      if (!config) { error('No configuration found. Run: vibe init'); return; }
      const [key, ...valueParts] = (opts.set as string).split('=');
      const value = valueParts.join('=');
      if (!key || !value) { error('Use --set key=value'); return; }
      if (!(key in config)) { error(`Unknown key: ${key}`); return; }
      (config as unknown as Record<string, string>)[key] = value;
      saveConfig(config);
      success(`Set ${key} = ${value}`);
    }
  });
