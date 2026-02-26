import { logger } from './logger.js';

export interface MemoryThresholds {
  heapUsedWarningMB: number;
  heapUsedCriticalMB: number;
  rssWarningMB: number;
  rssCriticalMB: number;
}

export interface MemorySnapshot {
  heapUsedMB: number;
  heapTotalMB: number;
  rssMB: number;
  externalMB: number;
  arrayBuffersMB: number;
  heapUsedPercent: number;
  timestamp: Date;
  status: 'ok' | 'warning' | 'critical';
}

const DEFAULT_THRESHOLDS: MemoryThresholds = {
  heapUsedWarningMB: 256,
  heapUsedCriticalMB: 512,
  rssWarningMB: 512,
  rssCriticalMB: 1024,
};

function toMB(bytes: number): number {
  return Math.round((bytes / 1024 / 1024) * 100) / 100;
}

export function captureMemorySnapshot(
  thresholds: Partial<MemoryThresholds> = {},
): MemorySnapshot {
  const t = { ...DEFAULT_THRESHOLDS, ...thresholds };
  const mem = process.memoryUsage();

  const heapUsedMB = toMB(mem.heapUsed);
  const heapTotalMB = toMB(mem.heapTotal);
  const rssMB = toMB(mem.rss);
  const externalMB = toMB(mem.external);
  const arrayBuffersMB = toMB(mem.arrayBuffers);
  const heapUsedPercent = heapTotalMB > 0
    ? Math.round((heapUsedMB / heapTotalMB) * 100)
    : 0;

  let status: MemorySnapshot['status'] = 'ok';
  if (heapUsedMB >= t.heapUsedCriticalMB || rssMB >= t.rssCriticalMB) {
    status = 'critical';
  } else if (heapUsedMB >= t.heapUsedWarningMB || rssMB >= t.rssWarningMB) {
    status = 'warning';
  }

  const snapshot: MemorySnapshot = {
    heapUsedMB,
    heapTotalMB,
    rssMB,
    externalMB,
    arrayBuffersMB,
    heapUsedPercent,
    timestamp: new Date(),
    status,
  };

  if (status === 'critical') {
    logger.error({ ...snapshot }, 'Memory usage CRITICAL');
  } else if (status === 'warning') {
    logger.warn({ ...snapshot }, 'Memory usage WARNING');
  }

  return snapshot;
}

export function startMemoryMonitor(
  intervalMs = 30_000,
  thresholds: Partial<MemoryThresholds> = {},
): { stop: () => void; getLatest: () => MemorySnapshot | null } {
  let latest: MemorySnapshot | null = null;

  const timer = setInterval(() => {
    latest = captureMemorySnapshot(thresholds);
  }, intervalMs);

  timer.unref();

  return {
    stop: () => clearInterval(timer),
    getLatest: () => latest,
  };
}
