import { Command } from 'commander';
import pc from 'picocolors';
import { header, info } from '../utils/display.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  outputFormat: 'text' | 'json' | 'minimal';
  colorEnabled: boolean;
  defaultSort: string;
  defaultLimit: number;
  showTips: boolean;
  dateFormat: 'iso' | 'relative' | 'short';
  timezone: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'auto',
  outputFormat: 'text',
  colorEnabled: true,
  defaultSort: 'risk',
  defaultLimit: 20,
  showTips: true,
  dateFormat: 'relative',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

const PREFS_FILE = path.join(os.homedir(), '.vibe-preferences.json');

function loadPreferences(): UserPreferences {
  try {
    if (fs.existsSync(PREFS_FILE)) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(fs.readFileSync(PREFS_FILE, 'utf-8')) };
    }
  } catch { /* use defaults */ }
  return { ...DEFAULT_PREFERENCES };
}

function savePreferences(prefs: UserPreferences): void {
  fs.writeFileSync(PREFS_FILE, JSON.stringify(prefs, null, 2), 'utf-8');
}

export const preferencesCommand = new Command('preferences')
  .description('Manage user preferences (theme, defaults, format)')
  .option('--get <key>', 'Get a preference value')
  .option('--set <key=value>', 'Set a preference value')
  .option('--reset', 'Reset all preferences to defaults')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Preferences');

    if (opts.reset) {
      savePreferences(DEFAULT_PREFERENCES);
      console.log(pc.green('  Preferences reset to defaults ✓'));
      return;
    }

    const prefs = loadPreferences();

    if (opts.get) {
      const key = opts.get as keyof UserPreferences;
      if (key in prefs) {
        console.log(`  ${pc.bold(key)}: ${String(prefs[key])}`);
      } else {
        console.log(pc.red(`  Unknown preference: ${key}`));
        console.log(pc.dim(`  Available: ${Object.keys(DEFAULT_PREFERENCES).join(', ')}`));
      }
      return;
    }

    if (opts.set) {
      const parts = (opts.set as string).split('=');
      const key = parts[0] as keyof UserPreferences | undefined;
      const value = parts.slice(1).join('=');
      if (!key || !(key in DEFAULT_PREFERENCES)) {
        console.log(pc.red(`  Unknown preference: ${key ?? ''}`));
        console.log(pc.dim(`  Available: ${Object.keys(DEFAULT_PREFERENCES).join(', ')}`));
        return;
      }

      const defaultVal = DEFAULT_PREFERENCES[key];
      if (typeof defaultVal === 'boolean') {
        (prefs as unknown as Record<string, unknown>)[key] = value === 'true';
      } else if (typeof defaultVal === 'number') {
        (prefs as unknown as Record<string, unknown>)[key] = parseInt(value, 10);
      } else {
        (prefs as unknown as Record<string, unknown>)[key] = value;
      }

      savePreferences(prefs);
      console.log(pc.green(`  Set ${key} = ${value} ✓`));
      return;
    }

    if (opts.json) {
      console.log(JSON.stringify(prefs, null, 2));
      return;
    }

    console.log(pc.bold('  Current Preferences\n'));
    for (const [key, value] of Object.entries(prefs)) {
      const isDefault = JSON.stringify(value) === JSON.stringify((DEFAULT_PREFERENCES as unknown as Record<string, unknown>)[key]);
      const tag = isDefault ? pc.dim(' (default)') : pc.cyan(' (custom)');
      console.log(`  ${pc.bold(key.padEnd(18))} ${String(value)}${tag}`);
    }
    console.log();
    info('Set a preference: vibe preferences --set theme=dark');
  });
