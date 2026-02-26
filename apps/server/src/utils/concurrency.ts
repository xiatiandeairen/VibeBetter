import { logger } from './logger.js';

export class Semaphore {
  private permits: number;
  private waiting: Array<() => void> = [];
  private readonly maxPermits: number;

  constructor(permits: number) {
    this.permits = permits;
    this.maxPermits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }
    return new Promise<void>((resolve) => {
      this.waiting.push(resolve);
    });
  }

  release(): void {
    const next = this.waiting.shift();
    if (next) {
      next();
    } else if (this.permits < this.maxPermits) {
      this.permits++;
    }
  }

  async withPermit<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  get available(): number {
    return this.permits;
  }

  get waitingCount(): number {
    return this.waiting.length;
  }
}

export class Mutex {
  private semaphore = new Semaphore(1);

  async lock(): Promise<void> {
    await this.semaphore.acquire();
  }

  unlock(): void {
    this.semaphore.release();
  }

  async withLock<T>(fn: () => Promise<T>): Promise<T> {
    return this.semaphore.withPermit(fn);
  }

  get isLocked(): boolean {
    return this.semaphore.available === 0;
  }
}

export class ConcurrencyLimiter {
  private semaphore: Semaphore;
  private running = 0;
  private completed = 0;
  private failed = 0;
  private readonly name: string;

  constructor(name: string, concurrency: number) {
    this.name = name;
    this.semaphore = new Semaphore(concurrency);
  }

  async run<T>(taskId: string, fn: () => Promise<T>): Promise<T> {
    await this.semaphore.acquire();
    this.running++;
    logger.debug({ limiter: this.name, taskId, running: this.running }, 'Task started');
    try {
      const result = await fn();
      this.completed++;
      return result;
    } catch (err) {
      this.failed++;
      throw err;
    } finally {
      this.running--;
      this.semaphore.release();
      logger.debug({ limiter: this.name, taskId, running: this.running }, 'Task finished');
    }
  }

  get stats() {
    return {
      name: this.name,
      running: this.running,
      completed: this.completed,
      failed: this.failed,
      waiting: this.semaphore.waitingCount,
      available: this.semaphore.available,
    };
  }
}

export function createCollectionLimiter(concurrency: number = 3): ConcurrencyLimiter {
  return new ConcurrencyLimiter('collection', concurrency);
}
