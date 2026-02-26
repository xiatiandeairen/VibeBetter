import { logger } from './logger.js';

export type ServiceName = 'redis' | 'database' | 'external-api' | 'queue' | 'cache' | 'search';
export type ServiceStatus = 'healthy' | 'degraded' | 'down';

export interface FallbackStrategy {
  service: ServiceName;
  status: ServiceStatus;
  fallbackType: 'cache' | 'default' | 'skip' | 'queue' | 'retry';
  description: string;
  maxRetries: number;
  retryDelayMs: number;
  lastChecked: Date;
}

interface ServiceHealthEntry {
  service: ServiceName;
  status: ServiceStatus;
  lastHealthy: Date | null;
  consecutiveFailures: number;
  fallback: FallbackStrategy;
}

const serviceHealth = new Map<ServiceName, ServiceHealthEntry>();

const DEFAULT_FALLBACKS: Record<ServiceName, FallbackStrategy> = {
  redis: {
    service: 'redis',
    status: 'healthy',
    fallbackType: 'cache',
    description: 'Use in-memory cache when Redis is unavailable',
    maxRetries: 3,
    retryDelayMs: 1000,
    lastChecked: new Date(),
  },
  database: {
    service: 'database',
    status: 'healthy',
    fallbackType: 'retry',
    description: 'Retry with exponential backoff on database failure',
    maxRetries: 5,
    retryDelayMs: 2000,
    lastChecked: new Date(),
  },
  'external-api': {
    service: 'external-api',
    status: 'healthy',
    fallbackType: 'default',
    description: 'Return cached/default data when external API is down',
    maxRetries: 2,
    retryDelayMs: 3000,
    lastChecked: new Date(),
  },
  queue: {
    service: 'queue',
    status: 'healthy',
    fallbackType: 'queue',
    description: 'Buffer tasks in memory when queue service is down',
    maxRetries: 3,
    retryDelayMs: 1000,
    lastChecked: new Date(),
  },
  cache: {
    service: 'cache',
    status: 'healthy',
    fallbackType: 'skip',
    description: 'Skip caching and hit origin directly',
    maxRetries: 1,
    retryDelayMs: 500,
    lastChecked: new Date(),
  },
  search: {
    service: 'search',
    status: 'healthy',
    fallbackType: 'default',
    description: 'Return empty results when search is unavailable',
    maxRetries: 2,
    retryDelayMs: 1500,
    lastChecked: new Date(),
  },
};

export function initFallbacks(): void {
  for (const [name, fallback] of Object.entries(DEFAULT_FALLBACKS)) {
    serviceHealth.set(name as ServiceName, {
      service: name as ServiceName,
      status: 'healthy',
      lastHealthy: new Date(),
      consecutiveFailures: 0,
      fallback,
    });
  }
  logger.info('Graceful degradation fallbacks initialized');
}

export function reportServiceDown(service: ServiceName): FallbackStrategy {
  const entry = serviceHealth.get(service);
  if (!entry) {
    const fallback = DEFAULT_FALLBACKS[service];
    fallback.status = 'down';
    return fallback;
  }

  entry.consecutiveFailures += 1;
  entry.status = entry.consecutiveFailures >= 3 ? 'down' : 'degraded';
  entry.fallback.status = entry.status;
  entry.fallback.lastChecked = new Date();

  logger.warn(
    { service, status: entry.status, failures: entry.consecutiveFailures },
    `Service ${service} reported as ${entry.status}`,
  );

  return entry.fallback;
}

export function reportServiceHealthy(service: ServiceName): void {
  const entry = serviceHealth.get(service);
  if (!entry) return;

  entry.status = 'healthy';
  entry.consecutiveFailures = 0;
  entry.lastHealthy = new Date();
  entry.fallback.status = 'healthy';
  entry.fallback.lastChecked = new Date();
}

export function getServiceStatus(): Array<{ service: ServiceName; status: ServiceStatus; failures: number }> {
  const result: Array<{ service: ServiceName; status: ServiceStatus; failures: number }> = [];
  for (const entry of serviceHealth.values()) {
    result.push({ service: entry.service, status: entry.status, failures: entry.consecutiveFailures });
  }
  return result;
}
