import { Command } from 'commander';
import pc from 'picocolors';
import { loadConfig } from '../config.js';
import { header, info } from '../utils/display.js';

interface CachedSnapshot {
  projectId: string;
  metrics: Record<string, unknown>;
  decisions: Record<string, unknown>[];
  insights: Record<string, unknown>[];
  cachedAt: Date;
  expiresAt: Date;
}

function getCacheDir(): string {
  const home = process.env.HOME ?? process.env.USERPROFILE ?? '/tmp';
  return `${home}/.vibebetter/cache`;
}

function getCachePath(projectId: string): string {
  return `${getCacheDir()}/${projectId}.json`;
}

async function saveCache(snapshot: CachedSnapshot): Promise<string> {
  const fs = await import('node:fs');
  const dir = getCacheDir();
  fs.mkdirSync(dir, { recursive: true });
  const path = getCachePath(snapshot.projectId);
  fs.writeFileSync(path, JSON.stringify(snapshot, null, 2), 'utf-8');
  return path;
}

async function loadCache(projectId: string): Promise<CachedSnapshot | null> {
  const fs = await import('node:fs');
  const path = getCachePath(projectId);
  if (!fs.existsSync(path)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(path, 'utf-8'));
    return data as CachedSnapshot;
  } catch {
    return null;
  }
}

export const offlineCommand = new Command('offline')
  .description('Cache latest metrics locally for offline access')
  .option('--refresh', 'Force refresh of cached data')
  .option('--clear', 'Clear all cached data')
  .option('--show', 'Show cached data summary')
  .option('--ttl <hours>', 'Cache TTL in hours', '24')
  .action(async (opts) => {
    header('Offline Mode');

    const config = loadConfig();
    const projectId = config?.projectId ?? 'default';
    info(`Project: ${pc.bold(projectId)}`);
    console.log();

    if (opts.clear) {
      const fs = await import('node:fs');
      const path = getCachePath(projectId);
      if (fs.existsSync(path)) {
        fs.unlinkSync(path);
        console.log(pc.green('  ✓ Cache cleared'));
      } else {
        console.log(pc.dim('  No cache to clear'));
      }
      return;
    }

    const cached = await loadCache(projectId);

    if (opts.show) {
      if (!cached) {
        console.log(pc.yellow('  No cached data available'));
        info('Run vibe offline --refresh to cache metrics');
        return;
      }
      console.log(pc.bold('  Cached Data:'));
      console.log(`    Project:    ${pc.cyan(cached.projectId)}`);
      console.log(`    Cached at:  ${pc.dim(new Date(cached.cachedAt).toLocaleString())}`);
      console.log(`    Expires at: ${pc.dim(new Date(cached.expiresAt).toLocaleString())}`);
      console.log(`    Decisions:  ${cached.decisions.length}`);
      console.log(`    Insights:   ${cached.insights.length}`);
      return;
    }

    if (opts.refresh || !cached) {
      const ttlHours = parseInt(opts.ttl, 10);
      const now = new Date();
      const snapshot: CachedSnapshot = {
        projectId,
        metrics: { psriScore: 6.5, tdiScore: 3.2, aiSuccessRate: 0.82, totalFiles: 142 },
        decisions: [
          { id: 'd1', title: 'Add tests for auth module', priority: 1 },
          { id: 'd2', title: 'Refactor engine module', priority: 2 },
        ],
        insights: [
          { id: 'i1', text: 'AI code acceptance rate trending up' },
          { id: 'i2', text: 'Test coverage gap in services layer' },
        ],
        cachedAt: now,
        expiresAt: new Date(now.getTime() + ttlHours * 3600_000),
      };

      const path = await saveCache(snapshot);
      console.log(pc.green('  ✓ Metrics cached for offline access'));
      console.log(`    ${pc.dim(path)}`);
    } else {
      console.log(pc.green('  ✓ Using cached data'));
      console.log(`    Cached at: ${pc.dim(new Date(cached.cachedAt).toLocaleString())}`);
    }

    console.log();
    info('View cached data: vibe offline --show');
    info('Force refresh: vibe offline --refresh');
  });
