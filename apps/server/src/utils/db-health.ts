import { logger } from './logger.js';

export interface PoolStats {
  totalConnections: number;
  idleConnections: number;
  activeConnections: number;
  waitingRequests: number;
  maxConnections: number;
  utilizationPercent: number;
}

export interface DbHealthResult {
  healthy: boolean;
  responseTimeMs: number;
  poolStats: PoolStats | null;
  version: string | null;
  errors: string[];
  checkedAt: Date;
}

export type DbHealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export function classifyHealth(result: DbHealthResult): DbHealthStatus {
  if (!result.healthy) return 'unhealthy';
  if (result.responseTimeMs > 1000) return 'degraded';
  if (result.poolStats && result.poolStats.utilizationPercent > 80) return 'degraded';
  if (result.poolStats && result.poolStats.waitingRequests > 5) return 'degraded';
  return 'healthy';
}

export async function checkDbHealth(
  queryFn: (sql: string) => Promise<unknown[]>,
  getPoolStats?: () => PoolStats,
): Promise<DbHealthResult> {
  const errors: string[] = [];
  let responseTimeMs = 0;
  let version: string | null = null;
  let poolStats: PoolStats | null = null;

  const start = Date.now();
  try {
    const rows = await queryFn('SELECT version()');
    responseTimeMs = Date.now() - start;
    if (Array.isArray(rows) && rows.length > 0) {
      const row = rows[0] as Record<string, string>;
      version = row['version'] ?? null;
    }
  } catch (err) {
    responseTimeMs = Date.now() - start;
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Database query failed: ${msg}`);
    logger.error({ err: msg, responseTimeMs }, 'DB health check failed');
  }

  if (getPoolStats) {
    try {
      poolStats = getPoolStats();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Pool stats unavailable: ${msg}`);
    }
  }

  const result: DbHealthResult = {
    healthy: errors.length === 0,
    responseTimeMs,
    poolStats,
    version,
    errors,
    checkedAt: new Date(),
  };

  const status = classifyHealth(result);
  if (status !== 'healthy') {
    logger.warn({ status, responseTimeMs, errors }, 'DB health degraded');
  }

  return result;
}

export function createPoolMonitor(getPoolStats: () => PoolStats, intervalMs: number = 30_000) {
  let timer: ReturnType<typeof setInterval> | null = null;
  let latestStats: PoolStats | null = null;

  function check() {
    try {
      latestStats = getPoolStats();
      if (latestStats.utilizationPercent > 90) {
        logger.warn({ ...latestStats }, 'Connection pool utilization critical');
      }
    } catch (err) {
      logger.error({ err: err instanceof Error ? err.message : String(err) }, 'Pool monitor error');
    }
  }

  return {
    start() {
      if (timer) return;
      check();
      timer = setInterval(check, intervalMs);
    },
    stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    },
    getStats(): PoolStats | null {
      return latestStats;
    },
  };
}
