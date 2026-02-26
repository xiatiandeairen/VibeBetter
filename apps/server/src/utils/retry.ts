import { logger } from './logger.js';

export interface RetryOptions {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  retryableErrors?: Array<string | RegExp>;
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
}

const defaults: RetryOptions = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30_000,
  backoffFactor: 2,
};

function isRetryable(err: unknown, patterns?: Array<string | RegExp>): boolean {
  if (!patterns || patterns.length === 0) return true;
  const message = err instanceof Error ? err.message : String(err);
  return patterns.some((p) => (typeof p === 'string' ? message.includes(p) : p.test(message)));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitter(delayMs: number): number {
  return delayMs + Math.random() * delayMs * 0.2;
}

export async function retry<T>(fn: () => Promise<T>, options?: Partial<RetryOptions>): Promise<T> {
  const opts = { ...defaults, ...options };
  let lastError: unknown;
  let delay = opts.initialDelayMs;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (attempt >= opts.maxAttempts) break;
      if (!isRetryable(err, opts.retryableErrors)) break;

      const actualDelay = Math.min(jitter(delay), opts.maxDelayMs);

      logger.warn(
        { attempt, maxAttempts: opts.maxAttempts, delayMs: Math.round(actualDelay), error: err instanceof Error ? err.message : String(err) },
        'Retrying after error',
      );

      opts.onRetry?.(err, attempt, actualDelay);
      await sleep(actualDelay);
      delay *= opts.backoffFactor;
    }
  }

  throw lastError;
}

export async function retryWithResult<T>(
  fn: () => Promise<T>,
  options?: Partial<RetryOptions>,
): Promise<{ data: T; attempts: number } | { data: null; error: unknown; attempts: number }> {
  const opts = { ...defaults, ...options };
  let lastError: unknown;
  let delay = opts.initialDelayMs;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      const data = await fn();
      return { data, attempts: attempt };
    } catch (err) {
      lastError = err;
      if (attempt >= opts.maxAttempts) break;
      if (!isRetryable(err, opts.retryableErrors)) break;

      const actualDelay = Math.min(jitter(delay), opts.maxDelayMs);
      await sleep(actualDelay);
      delay *= opts.backoffFactor;
    }
  }

  return { data: null, error: lastError, attempts: opts.maxAttempts };
}
