import IORedis from 'ioredis';
import { env } from '../config/env.js';
import { logger } from './logger.js';

const redis = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: 3 });

export async function getCached<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (err) {
    logger.warn({ err, key }, 'Cache read failed, fetching fresh');
  }

  const data = await fetcher();

  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
  } catch (err) {
    logger.warn({ err, key }, 'Cache write failed');
  }

  return data;
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    logger.warn({ err, pattern }, 'Cache invalidation failed');
  }
}
