import { logger } from './logger.js';

export type CacheNamespace = 'metrics' | 'overview' | 'user' | 'project' | 'report' | 'general';

export interface CacheTTLStrategy {
  namespace: CacheNamespace;
  ttlSeconds: number;
  staleWhileRevalidateSeconds: number;
  maxEntries: number;
}

export interface CacheKeyOptions {
  namespace: CacheNamespace;
  version?: number;
  segments: string[];
  params?: Record<string, string | number | boolean>;
}

export interface CacheEntry<T> {
  key: string;
  value: T;
  createdAt: number;
  expiresAt: number;
  staleAt: number;
  hits: number;
  namespace: CacheNamespace;
  version: number;
}

const DEFAULT_STRATEGIES: Record<CacheNamespace, CacheTTLStrategy> = {
  metrics: { namespace: 'metrics', ttlSeconds: 300, staleWhileRevalidateSeconds: 60, maxEntries: 1000 },
  overview: { namespace: 'overview', ttlSeconds: 120, staleWhileRevalidateSeconds: 30, maxEntries: 200 },
  user: { namespace: 'user', ttlSeconds: 600, staleWhileRevalidateSeconds: 120, maxEntries: 500 },
  project: { namespace: 'project', ttlSeconds: 180, staleWhileRevalidateSeconds: 60, maxEntries: 300 },
  report: { namespace: 'report', ttlSeconds: 900, staleWhileRevalidateSeconds: 180, maxEntries: 100 },
  general: { namespace: 'general', ttlSeconds: 60, staleWhileRevalidateSeconds: 15, maxEntries: 2000 },
};

export function buildCacheKey(options: CacheKeyOptions): string {
  const version = options.version ?? 1;
  const base = `v${version}:${options.namespace}:${options.segments.join(':')}`;

  if (!options.params || Object.keys(options.params).length === 0) return base;

  const sorted = Object.entries(options.params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  return `${base}?${sorted}`;
}

export function parseCacheKey(key: string): { namespace: string; version: number; segments: string[]; params: Record<string, string> } {
  const [mainPart, query] = key.split('?');
  const main = mainPart ?? '';
  const parts = main.split(':');
  const version = parseInt(parts[0]?.replace('v', '') ?? '1', 10);
  const namespace = parts[1] ?? 'general';
  const segments = parts.slice(2);
  const params: Record<string, string> = {};

  if (query) {
    for (const pair of query.split('&')) {
      const eqIdx = pair.indexOf('=');
      const k = eqIdx >= 0 ? pair.slice(0, eqIdx) : pair;
      const v = eqIdx >= 0 ? pair.slice(eqIdx + 1) : '';
      params[k] = v;
    }
  }

  return { namespace, version, segments, params };
}

export function getStrategy(namespace: CacheNamespace): CacheTTLStrategy {
  return DEFAULT_STRATEGIES[namespace];
}

export class CacheKeyBuilder {
  private namespace: CacheNamespace;
  private version: number;
  private segments: string[] = [];
  private params: Record<string, string | number | boolean> = {};

  constructor(namespace: CacheNamespace, version: number = 1) {
    this.namespace = namespace;
    this.version = version;
  }

  segment(...parts: string[]): this {
    this.segments.push(...parts);
    return this;
  }

  param(key: string, value: string | number | boolean): this {
    this.params[key] = value;
    return this;
  }

  build(): string {
    return buildCacheKey({
      namespace: this.namespace,
      version: this.version,
      segments: this.segments,
      params: Object.keys(this.params).length > 0 ? this.params : undefined,
    });
  }

  ttl(): number {
    return getStrategy(this.namespace).ttlSeconds;
  }
}

export function logCacheHit(key: string, hit: boolean): void {
  const parsed = parseCacheKey(key);
  logger.info({ key: parsed.namespace, hit, segments: parsed.segments.length }, hit ? 'Cache HIT' : 'Cache MISS');
}
