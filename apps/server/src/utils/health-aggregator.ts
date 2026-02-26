import { logger } from './logger.js';

export type SubsystemStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface SubsystemHealth {
  name: string;
  status: SubsystemStatus;
  message: string;
  latencyMs: number;
  checkedAt: Date;
}

export interface AggregatedHealth {
  overall: SubsystemStatus;
  subsystems: SubsystemHealth[];
  totalLatencyMs: number;
  timestamp: Date;
}

type HealthCheckFn = () => Promise<{ status: SubsystemStatus; message: string }>;

export class HealthAggregator {
  private readonly checks = new Map<string, HealthCheckFn>();

  register(name: string, fn: HealthCheckFn): void {
    this.checks.set(name, fn);
    logger.info({ subsystem: name }, 'Registered health check');
  }

  unregister(name: string): void {
    this.checks.delete(name);
  }

  async check(): Promise<AggregatedHealth> {
    const subsystems: SubsystemHealth[] = [];
    const start = Date.now();

    for (const [name, fn] of this.checks) {
      const checkStart = Date.now();
      try {
        const { status, message } = await fn();
        subsystems.push({ name, status, message, latencyMs: Date.now() - checkStart, checkedAt: new Date() });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        subsystems.push({ name, status: 'unhealthy', message: msg, latencyMs: Date.now() - checkStart, checkedAt: new Date() });
      }
    }

    const hasUnhealthy = subsystems.some((s) => s.status === 'unhealthy');
    const hasDegraded = subsystems.some((s) => s.status === 'degraded');
    const overall: SubsystemStatus = hasUnhealthy ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy';

    const result: AggregatedHealth = {
      overall,
      subsystems,
      totalLatencyMs: Date.now() - start,
      timestamp: new Date(),
    };

    logger.info({ overall, count: subsystems.length, totalLatencyMs: result.totalLatencyMs }, 'Health aggregation complete');
    return result;
  }
}
