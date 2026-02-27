import { logger } from './logger.js';

export type ServiceStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

export interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  responseTimeMs: number | null;
  lastChecked: Date;
  message: string | null;
  metadata: Record<string, unknown>;
}

export interface HealthReport {
  overall: ServiceStatus;
  timestamp: Date;
  uptimeSeconds: number;
  services: ServiceHealth[];
  version: string;
  environment: string;
}

export class HealthReporter {
  private readonly startTime = Date.now();
  private checks: Array<{ name: string; check: () => Promise<ServiceHealth> }> = [];

  register(name: string, check: () => Promise<ServiceHealth>): void {
    this.checks.push({ name, check });
    logger.debug({ service: name }, 'Health check registered');
  }

  async generateReport(version: string, environment: string): Promise<HealthReport> {
    const services: ServiceHealth[] = [];

    for (const { name, check } of this.checks) {
      try {
        const result = await check();
        services.push(result);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        services.push({
          name,
          status: 'down',
          responseTimeMs: null,
          lastChecked: new Date(),
          message: msg,
          metadata: {},
        });
      }
    }

    const statuses = services.map(s => s.status);
    let overall: ServiceStatus = 'healthy';
    if (statuses.includes('down')) {
      overall = 'down';
    } else if (statuses.includes('degraded')) {
      overall = 'degraded';
    }

    const report: HealthReport = {
      overall,
      timestamp: new Date(),
      uptimeSeconds: Math.round((Date.now() - this.startTime) / 1000),
      services,
      version,
      environment,
    };

    logger.info({ overall, serviceCount: services.length }, 'Health report generated');
    return report;
  }

  getRegisteredChecks(): string[] {
    return this.checks.map(c => c.name);
  }
}
