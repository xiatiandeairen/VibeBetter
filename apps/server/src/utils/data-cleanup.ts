import { logger } from './logger.js';

export interface RetentionPolicy {
  snapshots: number;
  jobs: number;
  events: number;
}

export interface CleanupResult {
  entity: string;
  deletedCount: number;
  retainedCount: number;
  durationMs: number;
}

export interface CleanupReport {
  results: CleanupResult[];
  totalDeleted: number;
  totalDurationMs: number;
  executedAt: Date;
}

const DEFAULT_RETENTION: RetentionPolicy = {
  snapshots: 90,
  jobs: 30,
  events: 60,
};

type CleanupFn = (retentionDays: number) => Promise<{ deleted: number; retained: number }>;

export class DataCleanup {
  private readonly policy: RetentionPolicy;
  private readonly cleaners = new Map<string, { fn: CleanupFn; retentionDays: number }>();

  constructor(policy: Partial<RetentionPolicy> = {}) {
    this.policy = { ...DEFAULT_RETENTION, ...policy };

    this.cleaners.set('snapshots', { fn: this.stubCleaner, retentionDays: this.policy.snapshots });
    this.cleaners.set('jobs', { fn: this.stubCleaner, retentionDays: this.policy.jobs });
    this.cleaners.set('events', { fn: this.stubCleaner, retentionDays: this.policy.events });
  }

  registerCleaner(entity: string, fn: CleanupFn, retentionDays: number): void {
    this.cleaners.set(entity, { fn, retentionDays });
    logger.info({ entity, retentionDays }, 'Registered data cleaner');
  }

  async run(): Promise<CleanupReport> {
    const start = Date.now();
    const results: CleanupResult[] = [];

    for (const [entity, { fn, retentionDays }] of this.cleaners) {
      const entityStart = Date.now();
      try {
        const { deleted, retained } = await fn(retentionDays);
        results.push({ entity, deletedCount: deleted, retainedCount: retained, durationMs: Date.now() - entityStart });
        logger.info({ entity, deleted, retained }, 'Cleanup completed');
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error({ entity, error: msg }, 'Cleanup failed');
        results.push({ entity, deletedCount: 0, retainedCount: 0, durationMs: Date.now() - entityStart });
      }
    }

    const report: CleanupReport = {
      results,
      totalDeleted: results.reduce((sum, r) => sum + r.deletedCount, 0),
      totalDurationMs: Date.now() - start,
      executedAt: new Date(),
    };

    logger.info({ totalDeleted: report.totalDeleted, totalDurationMs: report.totalDurationMs }, 'Data cleanup complete');
    return report;
  }

  private async stubCleaner(retentionDays: number): Promise<{ deleted: number; retained: number }> {
    logger.debug({ retentionDays }, 'Stub cleaner invoked — integrate with database layer');
    return { deleted: 0, retained: 0 };
  }
}
