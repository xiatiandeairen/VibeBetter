import { logger } from './logger.js';

export interface QueryTimerOptions {
  slowThresholdMs: number;
  logAllQueries: boolean;
  onSlow?: (query: string, durationMs: number) => void;
}

export interface QueryTimerResult<T> {
  result: T;
  durationMs: number;
  slow: boolean;
}

const DEFAULT_OPTIONS: QueryTimerOptions = {
  slowThresholdMs: 100,
  logAllQueries: false,
};

export async function timedQuery<T>(
  label: string,
  queryFn: () => Promise<T>,
  options: Partial<QueryTimerOptions> = {},
): Promise<QueryTimerResult<T>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const start = performance.now();

  try {
    const result = await queryFn();
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    const slow = durationMs > opts.slowThresholdMs;

    if (slow) {
      logger.warn({ query: label, durationMs, threshold: opts.slowThresholdMs }, `Slow query detected: ${label}`);
      opts.onSlow?.(label, durationMs);
    } else if (opts.logAllQueries) {
      logger.info({ query: label, durationMs }, `Query completed: ${label}`);
    }

    return { result, durationMs, slow };
  } catch (error) {
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    logger.error({ query: label, durationMs, error: error instanceof Error ? error.message : String(error) }, `Query failed: ${label}`);
    throw error;
  }
}

export function createQueryTimer(globalOptions: Partial<QueryTimerOptions> = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...globalOptions };

  return {
    async time<T>(label: string, queryFn: () => Promise<T>, overrides: Partial<QueryTimerOptions> = {}): Promise<QueryTimerResult<T>> {
      return timedQuery(label, queryFn, { ...opts, ...overrides });
    },
  };
}

export function queryTimerDecorator(label?: string, options: Partial<QueryTimerOptions> = {}) {
  return function (_target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = async function (...args: unknown[]) {
      const queryLabel = label ?? propertyKey;
      const { result } = await timedQuery(queryLabel, () => original.apply(this, args), options);
      return result;
    };
    return descriptor;
  };
}
