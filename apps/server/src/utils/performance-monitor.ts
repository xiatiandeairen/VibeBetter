import { logger } from './logger.js';

export interface MemorySnapshot {
  rssBytes: number;
  heapTotalBytes: number;
  heapUsedBytes: number;
  externalBytes: number;
  arrayBuffersBytes: number;
  heapUsagePercent: number;
}

export interface EventLoopMetrics {
  lagMs: number;
  avgLagMs: number;
  maxLagMs: number;
  samples: number;
}

export interface GCMetrics {
  totalCollections: number;
  totalPauseMs: number;
  avgPauseMs: number;
  maxPauseMs: number;
}

export interface PerformanceSnapshot {
  memory: MemorySnapshot;
  eventLoop: EventLoopMetrics;
  gc: GCMetrics;
  uptimeSeconds: number;
  cpuUsagePercent: number;
  timestamp: Date;
}

export interface PerformanceMonitorConfig {
  checkIntervalMs: number;
  heapWarningThreshold: number;
  lagWarningMs: number;
  maxSamples: number;
}

const DEFAULT_CONFIG: PerformanceMonitorConfig = {
  checkIntervalMs: 15_000,
  heapWarningThreshold: 0.85,
  lagWarningMs: 100,
  maxSamples: 1000,
};

export class PerformanceMonitor {
  private readonly config: PerformanceMonitorConfig;
  private timer: ReturnType<typeof setInterval> | null = null;
  private lagSamples: number[] = [];
  private maxLag = 0;
  private gcCount = 0;
  private gcTotalPauseMs = 0;
  private gcMaxPauseMs = 0;
  private lastCpuUsage = process.cpuUsage();
  private lastCpuTime = Date.now();

  constructor(config: Partial<PerformanceMonitorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  getMemorySnapshot(): MemorySnapshot {
    const mem = process.memoryUsage();
    return {
      rssBytes: mem.rss,
      heapTotalBytes: mem.heapTotal,
      heapUsedBytes: mem.heapUsed,
      externalBytes: mem.external,
      arrayBuffersBytes: mem.arrayBuffers,
      heapUsagePercent: mem.heapTotal > 0 ? (mem.heapUsed / mem.heapTotal) * 100 : 0,
    };
  }

  recordEventLoopLag(lagMs: number): void {
    this.lagSamples.push(lagMs);
    this.maxLag = Math.max(this.maxLag, lagMs);
    if (this.lagSamples.length > this.config.maxSamples) {
      this.lagSamples.shift();
    }
    if (lagMs > this.config.lagWarningMs) {
      logger.warn({ lagMs }, 'Event loop lag exceeds threshold');
    }
  }

  getEventLoopMetrics(): EventLoopMetrics {
    const n = this.lagSamples.length;
    const avg = n > 0 ? this.lagSamples.reduce((a, b) => a + b, 0) / n : 0;
    return {
      lagMs: n > 0 ? (this.lagSamples[n - 1] ?? 0) : 0,
      avgLagMs: Math.round(avg * 100) / 100,
      maxLagMs: this.maxLag,
      samples: n,
    };
  }

  recordGC(pauseMs: number): void {
    this.gcCount++;
    this.gcTotalPauseMs += pauseMs;
    this.gcMaxPauseMs = Math.max(this.gcMaxPauseMs, pauseMs);
  }

  getGCMetrics(): GCMetrics {
    return {
      totalCollections: this.gcCount,
      totalPauseMs: this.gcTotalPauseMs,
      avgPauseMs: this.gcCount > 0 ? this.gcTotalPauseMs / this.gcCount : 0,
      maxPauseMs: this.gcMaxPauseMs,
    };
  }

  getCpuUsagePercent(): number {
    const now = Date.now();
    const elapsed = now - this.lastCpuTime;
    if (elapsed === 0) return 0;
    const usage = process.cpuUsage(this.lastCpuUsage);
    const totalMicros = usage.user + usage.system;
    const percent = (totalMicros / 1000 / elapsed) * 100;
    this.lastCpuUsage = process.cpuUsage();
    this.lastCpuTime = now;
    return Math.round(percent * 100) / 100;
  }

  getSnapshot(): PerformanceSnapshot {
    const memory = this.getMemorySnapshot();

    if (memory.heapUsagePercent >= this.config.heapWarningThreshold * 100) {
      logger.warn({ heapUsagePercent: memory.heapUsagePercent }, 'Heap usage above threshold');
    }

    return {
      memory,
      eventLoop: this.getEventLoopMetrics(),
      gc: this.getGCMetrics(),
      uptimeSeconds: Math.round(process.uptime()),
      cpuUsagePercent: this.getCpuUsagePercent(),
      timestamp: new Date(),
    };
  }

  start(): void {
    let lastTime = Date.now();

    this.timer = setInterval(() => {
      const now = Date.now();
      const lag = now - lastTime - this.config.checkIntervalMs;
      this.recordEventLoopLag(Math.max(0, lag));
      lastTime = now;

      const snap = this.getSnapshot();
      logger.debug({ rss: snap.memory.rssBytes, heapPct: snap.memory.heapUsagePercent, lag: snap.eventLoop.lagMs }, 'Performance check');
    }, this.config.checkIntervalMs);

    logger.info({ intervalMs: this.config.checkIntervalMs }, 'Performance monitor started');
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  reset(): void {
    this.lagSamples = [];
    this.maxLag = 0;
    this.gcCount = 0;
    this.gcTotalPauseMs = 0;
    this.gcMaxPauseMs = 0;
  }
}
