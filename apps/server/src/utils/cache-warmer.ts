import { logger } from './logger.js';

export interface CacheWarmTarget {
  key: string;
  fetcher: () => Promise<unknown>;
  ttlSeconds: number;
  priority: 'high' | 'medium' | 'low';
}

export interface WarmResult {
  key: string;
  success: boolean;
  durationMs: number;
  error: string | null;
}

export class CacheWarmer {
  private targets: CacheWarmTarget[] = [];

  register(target: CacheWarmTarget): void {
    this.targets.push(target);
    this.targets.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    });
    logger.debug({ key: target.key, priority: target.priority }, 'Cache warm target registered');
  }

  async warmAll(
    cacheSet: (key: string, value: unknown, ttl: number) => Promise<void>,
  ): Promise<WarmResult[]> {
    const results: WarmResult[] = [];
    logger.info({ targets: this.targets.length }, 'Starting cache warm-up');

    for (const target of this.targets) {
      const start = Date.now();
      try {
        const data = await target.fetcher();
        await cacheSet(target.key, data, target.ttlSeconds);
        results.push({ key: target.key, success: true, durationMs: Date.now() - start, error: null });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error({ key: target.key, error: msg }, 'Cache warm failed');
        results.push({ key: target.key, success: false, durationMs: Date.now() - start, error: msg });
      }
    }

    const succeeded = results.filter(r => r.success).length;
    const totalMs = results.reduce((s, r) => s + r.durationMs, 0);
    logger.info({ succeeded, failed: results.length - succeeded, totalMs }, 'Cache warm-up complete');

    return results;
  }

  getTargets(): CacheWarmTarget[] {
    return [...this.targets];
  }

  clear(): void {
    this.targets = [];
  }
}
