import { logger } from './logger.js';

export interface QueryStats {
  totalQueries: number;
  slowQueries: number;
  avgDurationMs: number;
  maxDurationMs: number;
  queriesByTable: Record<string, number>;
}

export interface ConnectionPoolStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
  maxConnections: number;
  utilizationPercent: number;
}

export interface DatabaseHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  queryStats: QueryStats;
  poolStats: ConnectionPoolStats;
  slowQueryLog: SlowQueryEntry[];
  checkedAt: Date;
}

export interface SlowQueryEntry {
  query: string;
  durationMs: number;
  table: string | null;
  timestamp: Date;
}

export interface DatabaseMonitorConfig {
  slowQueryThresholdMs: number;
  maxSlowQueryLogSize: number;
  checkIntervalMs: number;
  poolWarningThreshold: number;
}

const DEFAULT_CONFIG: DatabaseMonitorConfig = {
  slowQueryThresholdMs: 500,
  maxSlowQueryLogSize: 100,
  checkIntervalMs: 30_000,
  poolWarningThreshold: 0.8,
};

export class DatabaseMonitor {
  private readonly config: DatabaseMonitorConfig;
  private queryCount = 0;
  private slowQueryCount = 0;
  private totalDurationMs = 0;
  private maxDurationMs = 0;
  private readonly queriesByTable = new Map<string, number>();
  private readonly slowQueryLog: SlowQueryEntry[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<DatabaseMonitorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  recordQuery(query: string, durationMs: number, table: string | null = null): void {
    this.queryCount++;
    this.totalDurationMs += durationMs;
    this.maxDurationMs = Math.max(this.maxDurationMs, durationMs);

    if (table) {
      this.queriesByTable.set(table, (this.queriesByTable.get(table) ?? 0) + 1);
    }

    if (durationMs >= this.config.slowQueryThresholdMs) {
      this.slowQueryCount++;
      this.slowQueryLog.push({ query: query.slice(0, 200), durationMs, table, timestamp: new Date() });

      if (this.slowQueryLog.length > this.config.maxSlowQueryLogSize) {
        this.slowQueryLog.shift();
      }

      logger.warn({ durationMs, table, query: query.slice(0, 80) }, 'Slow query detected');
    }
  }

  getQueryStats(): QueryStats {
    return {
      totalQueries: this.queryCount,
      slowQueries: this.slowQueryCount,
      avgDurationMs: this.queryCount > 0 ? this.totalDurationMs / this.queryCount : 0,
      maxDurationMs: this.maxDurationMs,
      queriesByTable: Object.fromEntries(this.queriesByTable),
    };
  }

  getPoolStats(active: number, idle: number, waiting: number, max: number): ConnectionPoolStats {
    const total = active + idle;
    return {
      totalConnections: total,
      activeConnections: active,
      idleConnections: idle,
      waitingRequests: waiting,
      maxConnections: max,
      utilizationPercent: max > 0 ? (active / max) * 100 : 0,
    };
  }

  getHealth(poolActive: number, poolIdle: number, poolWaiting: number, poolMax: number): DatabaseHealth {
    const queryStats = this.getQueryStats();
    const poolStats = this.getPoolStats(poolActive, poolIdle, poolWaiting, poolMax);

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (poolStats.utilizationPercent >= this.config.poolWarningThreshold * 100) {
      status = 'degraded';
    }
    if (poolWaiting > 0 || poolStats.utilizationPercent >= 95) {
      status = 'unhealthy';
    }

    return { status, queryStats, poolStats, slowQueryLog: [...this.slowQueryLog], checkedAt: new Date() };
  }

  startPeriodicCheck(checkFn: () => void): void {
    this.timer = setInterval(checkFn, this.config.checkIntervalMs);
    logger.info({ intervalMs: this.config.checkIntervalMs }, 'Database monitor periodic check started');
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  reset(): void {
    this.queryCount = 0;
    this.slowQueryCount = 0;
    this.totalDurationMs = 0;
    this.maxDurationMs = 0;
    this.queriesByTable.clear();
    this.slowQueryLog.length = 0;
  }
}
