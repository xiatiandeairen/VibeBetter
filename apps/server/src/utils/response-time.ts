import type { Context, Next } from 'hono';
import { logger } from './logger.js';

interface PercentileTracker {
  values: number[];
  maxSamples: number;
}

const tracker: PercentileTracker = {
  values: [],
  maxSamples: 10_000,
};

function insertSorted(arr: number[], value: number, max: number): void {
  if (arr.length >= max) arr.shift();
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if ((arr[mid] ?? 0) < value) lo = mid + 1;
    else hi = mid;
  }
  arr.splice(lo, 0, value);
}

export function getPercentile(p: number): number | null {
  const { values } = tracker;
  if (values.length === 0) return null;
  const idx = Math.ceil((p / 100) * values.length) - 1;
  return values[Math.max(0, idx)] ?? null;
}

export function getResponseTimeStats(): {
  count: number;
  p50: number | null;
  p90: number | null;
  p95: number | null;
  p99: number | null;
} {
  return {
    count: tracker.values.length,
    p50: getPercentile(50),
    p90: getPercentile(90),
    p95: getPercentile(95),
    p99: getPercentile(99),
  };
}

export async function responseTimeMiddleware(c: Context, next: Next): Promise<void> {
  const start = performance.now();
  await next();
  const duration = performance.now() - start;

  insertSorted(tracker.values, duration, tracker.maxSamples);

  c.header('X-Response-Time', `${duration.toFixed(2)}ms`);

  if (tracker.values.length % 500 === 0) {
    const stats = getResponseTimeStats();
    logger.info(
      { p50: stats.p50?.toFixed(1), p90: stats.p90?.toFixed(1), p95: stats.p95?.toFixed(1), p99: stats.p99?.toFixed(1), samples: stats.count },
      'Response time percentiles',
    );
  }
}
