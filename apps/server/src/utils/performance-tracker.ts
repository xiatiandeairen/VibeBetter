import { logger } from './logger.js';

export interface ResponseTimeSample {
  endpoint: string;
  method: string;
  durationMs: number;
  statusCode: number;
  timestamp: Date;
}

export interface PercentileResult {
  endpoint: string;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  avg: number;
  min: number;
  max: number;
  sampleCount: number;
}

export class PerformanceTracker {
  private samples = new Map<string, number[]>();
  private readonly maxSamples: number;

  constructor(maxSamples = 10000) {
    this.maxSamples = maxSamples;
  }

  record(sample: ResponseTimeSample): void {
    const key = `${sample.method}:${sample.endpoint}`;
    let list = this.samples.get(key);
    if (!list) {
      list = [];
      this.samples.set(key, list);
    }

    list.push(sample.durationMs);
    if (list.length > this.maxSamples) {
      list.shift();
    }
  }

  getPercentiles(endpoint: string, method = 'GET'): PercentileResult | null {
    const key = `${method}:${endpoint}`;
    const list = this.samples.get(key);
    if (!list || list.length === 0) return null;

    const sorted = [...list].sort((a, b) => a - b);
    const n = sorted.length;

    const result: PercentileResult = {
      endpoint,
      p50: sorted[Math.floor(n * 0.5)] ?? 0,
      p90: sorted[Math.floor(n * 0.9)] ?? 0,
      p95: sorted[Math.floor(n * 0.95)] ?? 0,
      p99: sorted[Math.floor(n * 0.99)] ?? 0,
      avg: Math.round(sorted.reduce((s, v) => s + v, 0) / n),
      min: sorted[0] ?? 0,
      max: sorted[n - 1] ?? 0,
      sampleCount: n,
    };

    logger.debug({ endpoint, p95: result.p95, samples: n }, 'Percentiles computed');
    return result;
  }

  getAllPercentiles(): PercentileResult[] {
    const results: PercentileResult[] = [];
    for (const key of this.samples.keys()) {
      const [method, endpoint] = key.split(':') as [string, string];
      const result = this.getPercentiles(endpoint, method);
      if (result) results.push(result);
    }
    return results;
  }

  clear(): void {
    this.samples.clear();
    logger.info('Performance tracker cleared');
  }
}
