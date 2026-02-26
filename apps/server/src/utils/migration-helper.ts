import { logger } from './logger.js';

export type MigrationDirection = 'up' | 'down';
export type MigrationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';

export interface MigrationStep {
  version: string;
  name: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
  timestamp: number;
}

export interface MigrationRecord {
  version: string;
  name: string;
  status: MigrationStatus;
  appliedAt: Date | null;
  rolledBackAt: Date | null;
  durationMs: number;
  error: string | null;
}

export interface MigrationResult {
  success: boolean;
  applied: MigrationRecord[];
  skipped: string[];
  errors: MigrationRecord[];
  totalDurationMs: number;
}

export class MigrationRunner {
  private steps: MigrationStep[] = [];
  private applied: Set<string> = new Set();

  register(step: MigrationStep): void {
    this.steps.push(step);
    this.steps.sort((a, b) => a.timestamp - b.timestamp);
  }

  markApplied(versions: string[]): void {
    for (const v of versions) this.applied.add(v);
  }

  async migrate(direction: MigrationDirection = 'up'): Promise<MigrationResult> {
    const start = Date.now();
    const applied: MigrationRecord[] = [];
    const skipped: string[] = [];
    const errors: MigrationRecord[] = [];

    const orderedSteps = direction === 'up' ? [...this.steps] : [...this.steps].reverse();

    for (const step of orderedSteps) {
      if (direction === 'up' && this.applied.has(step.version)) {
        skipped.push(step.version);
        continue;
      }
      if (direction === 'down' && !this.applied.has(step.version)) {
        skipped.push(step.version);
        continue;
      }

      const record: MigrationRecord = {
        version: step.version,
        name: step.name,
        status: 'running',
        appliedAt: null,
        rolledBackAt: null,
        durationMs: 0,
        error: null,
      };

      const stepStart = Date.now();
      try {
        if (direction === 'up') {
          await step.up();
          record.status = 'completed';
          record.appliedAt = new Date();
          this.applied.add(step.version);
        } else {
          await step.down();
          record.status = 'rolled_back';
          record.rolledBackAt = new Date();
          this.applied.delete(step.version);
        }
        record.durationMs = Date.now() - stepStart;
        applied.push(record);
        logger.info({ version: step.version, direction, durationMs: record.durationMs }, `Migration ${direction}: ${step.name}`);
      } catch (err) {
        record.status = 'failed';
        record.error = err instanceof Error ? err.message : String(err);
        record.durationMs = Date.now() - stepStart;
        errors.push(record);
        logger.error({ version: step.version, error: record.error }, `Migration failed: ${step.name}`);
        break;
      }
    }

    return {
      success: errors.length === 0,
      applied,
      skipped,
      errors,
      totalDurationMs: Date.now() - start,
    };
  }

  async rollbackLast(): Promise<MigrationResult> {
    const lastApplied = [...this.steps].reverse().find((s) => this.applied.has(s.version));
    if (!lastApplied) {
      return { success: true, applied: [], skipped: [], errors: [], totalDurationMs: 0 };
    }

    const start = Date.now();
    const record: MigrationRecord = {
      version: lastApplied.version,
      name: lastApplied.name,
      status: 'running',
      appliedAt: null,
      rolledBackAt: null,
      durationMs: 0,
      error: null,
    };

    try {
      await lastApplied.down();
      record.status = 'rolled_back';
      record.rolledBackAt = new Date();
      record.durationMs = Date.now() - start;
      this.applied.delete(lastApplied.version);
      logger.info({ version: lastApplied.version }, `Rolled back: ${lastApplied.name}`);
      return { success: true, applied: [record], skipped: [], errors: [], totalDurationMs: record.durationMs };
    } catch (err) {
      record.status = 'failed';
      record.error = err instanceof Error ? err.message : String(err);
      record.durationMs = Date.now() - start;
      return { success: false, applied: [], skipped: [], errors: [record], totalDurationMs: record.durationMs };
    }
  }

  getPending(): MigrationStep[] {
    return this.steps.filter((s) => !this.applied.has(s.version));
  }

  getApplied(): string[] {
    return [...this.applied];
  }
}
