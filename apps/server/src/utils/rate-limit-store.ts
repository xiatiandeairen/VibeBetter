export interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitStore {
  get(key: string): Promise<RateLimitEntry | null>;
  set(key: string, entry: RateLimitEntry, ttlMs: number): Promise<void>;
  increment(key: string): Promise<number>;
  reset(key: string): Promise<void>;
}

export class RedisRateLimitStore implements RateLimitStore {
  private prefix: string;
  private redis: {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, options?: { PX?: number }): Promise<unknown>;
    incr(key: string): Promise<number>;
    del(key: string): Promise<number>;
  };

  constructor(redisClient: RedisRateLimitStore['redis'], prefix = 'rl:') {
    this.redis = redisClient;
    this.prefix = prefix;
  }

  async get(key: string): Promise<RateLimitEntry | null> {
    const raw = await this.redis.get(`${this.prefix}${key}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as RateLimitEntry;
    } catch {
      return null;
    }
  }

  async set(key: string, entry: RateLimitEntry, ttlMs: number): Promise<void> {
    await this.redis.set(`${this.prefix}${key}`, JSON.stringify(entry), { PX: ttlMs });
  }

  async increment(key: string): Promise<number> {
    return this.redis.incr(`${this.prefix}${key}:count`);
  }

  async reset(key: string): Promise<void> {
    await this.redis.del(`${this.prefix}${key}`);
    await this.redis.del(`${this.prefix}${key}:count`);
  }
}

export class InMemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, RateLimitEntry>();

  async get(key: string): Promise<RateLimitEntry | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.resetAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry;
  }

  async set(key: string, entry: RateLimitEntry, _ttlMs: number): Promise<void> {
    this.store.set(key, entry);
  }

  async increment(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return 1;
    entry.count++;
    return entry.count;
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }
}
