import { Command } from 'commander';
import pc from 'picocolors';
import { existsSync, rmSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';
import { header, info } from '../utils/display.js';

interface ResetResult {
  item: string;
  removed: boolean;
  error: string | null;
}

function tryRemove(path: string): ResetResult {
  const name = path.split('/').pop() ?? path;
  if (!existsSync(path)) {
    return { item: name, removed: false, error: null };
  }
  try {
    const stat = statSync(path);
    rmSync(path, { recursive: stat.isDirectory(), force: true });
    return { item: name, removed: true, error: null };
  } catch (err) {
    return { item: name, removed: false, error: String(err) };
  }
}

function getCacheDir(): string {
  const home = process.env.HOME ?? process.env.USERPROFILE ?? '/tmp';
  return resolve(home, '.vibebetter');
}

export const resetCommand = new Command('reset')
  .description('Reset CLI config and clear cache')
  .option('--config', 'Only reset config file')
  .option('--cache', 'Only clear cache directory')
  .option('--all', 'Reset everything (config + cache)')
  .option('--json', 'Output as JSON')
  .option('--dry-run', 'Show what would be removed without deleting')
  .action(async (opts) => {
    header('VibeBetter Reset');

    const resetConfig = opts.all || opts.config || (!opts.cache);
    const resetCache = opts.all || opts.cache || (!opts.config);

    const results: ResetResult[] = [];
    const cacheDir = getCacheDir();
    const configPath = resolve(process.cwd(), '.vibeconfig');

    if (resetConfig) {
      if (opts.dryRun) {
        results.push({ item: '.vibeconfig', removed: existsSync(configPath), error: null });
      } else {
        results.push(tryRemove(configPath));
      }
    }

    if (resetCache) {
      if (existsSync(cacheDir)) {
        if (opts.dryRun) {
          const entries = readdirSync(cacheDir);
          for (const e of entries) {
            results.push({ item: `cache/${e}`, removed: true, error: null });
          }
        } else {
          results.push(tryRemove(cacheDir));
        }
      } else {
        results.push({ item: 'cache', removed: false, error: null });
      }
    }

    if (opts.json) {
      console.log(JSON.stringify(results, null, 2));
      return;
    }

    console.log();
    for (const r of results) {
      if (r.error) {
        console.log(`  ${pc.red('\u2718')} ${r.item} — ${pc.red(r.error)}`);
      } else if (r.removed) {
        const prefix = opts.dryRun ? 'would remove' : 'removed';
        console.log(`  ${pc.green('\u2714')} ${r.item} — ${pc.dim(prefix)}`);
      } else {
        console.log(`  ${pc.dim('\u2013')} ${r.item} — ${pc.dim('not found')}`);
      }
    }

    const removed = results.filter((r) => r.removed).length;
    console.log();
    if (opts.dryRun) {
      console.log(pc.yellow(`  Dry run: ${removed} item(s) would be removed`));
    } else {
      console.log(pc.green(`  ${removed} item(s) reset successfully`));
    }
    console.log();
    info('Run vibe init to set up a fresh configuration');
  });
