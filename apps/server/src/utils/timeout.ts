import { logger } from './logger.js';

export class TimeoutError extends Error {
  readonly timeoutMs: number;
  readonly operation: string;

  constructor(operation: string, timeoutMs: number) {
    super(`Operation "${operation}" timed out after ${timeoutMs}ms`);
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
    this.operation = operation;
  }
}

export interface TimeoutOptions {
  timeoutMs: number;
  operation?: string;
  onTimeout?: () => void;
}

export async function withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  options: TimeoutOptions,
): Promise<T> {
  const { timeoutMs, operation = 'unknown', onTimeout } = options;
  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
    onTimeout?.();
    logger.warn({ operation, timeoutMs }, 'Operation timed out');
  }, timeoutMs);

  try {
    const result = await fn(controller.signal);
    return result;
  } catch (err) {
    if (controller.signal.aborted) {
      throw new TimeoutError(operation, timeoutMs);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export function withRequestTimeout(timeoutMs: number) {
  return async function timeoutMiddleware(
    ctx: { req: { url: string }; header: (k: string, v: string) => void },
    next: () => Promise<void>,
  ): Promise<void> {
    const start = Date.now();
    const operation = ctx.req.url;

    await withTimeout(
      async () => {
        await next();
      },
      {
        timeoutMs,
        operation,
        onTimeout: () => {
          ctx.header('X-Timeout', 'true');
        },
      },
    );

    const elapsed = Date.now() - start;
    ctx.header('X-Response-Time', `${elapsed}ms`);
  };
}
