import { logger } from './logger.js';

export interface PoolOptions {
  name: string;
  maxSize: number;
  minSize?: number;
  acquireTimeoutMs?: number;
  idleTimeoutMs?: number;
  healthCheckIntervalMs?: number;
}

export interface PoolStats {
  name: string;
  size: number;
  available: number;
  borrowed: number;
  waitingRequests: number;
  totalCreated: number;
  totalDestroyed: number;
}

interface PoolEntry<T> {
  resource: T;
  createdAt: number;
  lastUsedAt: number;
  borrowed: boolean;
}

export class ConnectionPool<T> {
  private readonly entries: PoolEntry<T>[] = [];
  private readonly waitQueue: Array<{ resolve: (r: T) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }> = [];
  private totalCreated = 0;
  private totalDestroyed = 0;
  private healthTimer?: ReturnType<typeof setInterval>;
  private readonly opts: Required<PoolOptions>;

  constructor(
    options: PoolOptions,
    private readonly factory: () => Promise<T>,
    private readonly destroyer: (resource: T) => Promise<void>,
    private readonly validator?: (resource: T) => Promise<boolean>,
  ) {
    this.opts = {
      minSize: 0,
      acquireTimeoutMs: 10_000,
      idleTimeoutMs: 60_000,
      healthCheckIntervalMs: 30_000,
      ...options,
    };
  }

  async initialize(): Promise<void> {
    for (let i = 0; i < this.opts.minSize; i++) {
      const resource = await this.factory();
      this.entries.push({ resource, createdAt: Date.now(), lastUsedAt: Date.now(), borrowed: false });
      this.totalCreated++;
    }
    this.healthTimer = setInterval(() => this.evictIdle(), this.opts.healthCheckIntervalMs);
    logger.info({ pool: this.opts.name, size: this.entries.length }, 'Connection pool initialized');
  }

  async acquire(): Promise<T> {
    const available = this.entries.find((e) => !e.borrowed);

    if (available) {
      if (this.validator) {
        const valid = await this.validator(available.resource).catch(() => false);
        if (!valid) {
          await this.remove(available);
          return this.acquire();
        }
      }
      available.borrowed = true;
      available.lastUsedAt = Date.now();
      return available.resource;
    }

    if (this.entries.length < this.opts.maxSize) {
      const resource = await this.factory();
      this.totalCreated++;
      const entry: PoolEntry<T> = { resource, createdAt: Date.now(), lastUsedAt: Date.now(), borrowed: true };
      this.entries.push(entry);
      return resource;
    }

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        const idx = this.waitQueue.findIndex((w) => w.resolve === resolve);
        if (idx >= 0) this.waitQueue.splice(idx, 1);
        reject(new Error(`Pool "${this.opts.name}" acquire timeout after ${this.opts.acquireTimeoutMs}ms`));
      }, this.opts.acquireTimeoutMs);
      this.waitQueue.push({ resolve, reject, timer });
    });
  }

  release(resource: T): void {
    const entry = this.entries.find((e) => e.resource === resource);
    if (!entry) return;

    entry.borrowed = false;
    entry.lastUsedAt = Date.now();

    if (this.waitQueue.length > 0) {
      const waiter = this.waitQueue.shift()!;
      clearTimeout(waiter.timer);
      entry.borrowed = true;
      waiter.resolve(resource);
    }
  }

  async shutdown(): Promise<void> {
    if (this.healthTimer) clearInterval(this.healthTimer);
    for (const waiter of this.waitQueue) {
      clearTimeout(waiter.timer);
      waiter.reject(new Error('Pool shutting down'));
    }
    this.waitQueue.length = 0;

    for (const entry of this.entries) {
      await this.destroyer(entry.resource).catch(() => {});
      this.totalDestroyed++;
    }
    this.entries.length = 0;
    logger.info({ pool: this.opts.name }, 'Connection pool shut down');
  }

  getStats(): PoolStats {
    return {
      name: this.opts.name,
      size: this.entries.length,
      available: this.entries.filter((e) => !e.borrowed).length,
      borrowed: this.entries.filter((e) => e.borrowed).length,
      waitingRequests: this.waitQueue.length,
      totalCreated: this.totalCreated,
      totalDestroyed: this.totalDestroyed,
    };
  }

  private async evictIdle(): Promise<void> {
    const now = Date.now();
    const idle = this.entries.filter(
      (e) => !e.borrowed && now - e.lastUsedAt > this.opts.idleTimeoutMs && this.entries.length > this.opts.minSize,
    );
    for (const entry of idle) {
      await this.remove(entry);
    }
  }

  private async remove(entry: PoolEntry<T>): Promise<void> {
    const idx = this.entries.indexOf(entry);
    if (idx >= 0) {
      this.entries.splice(idx, 1);
      await this.destroyer(entry.resource).catch(() => {});
      this.totalDestroyed++;
    }
  }
}
