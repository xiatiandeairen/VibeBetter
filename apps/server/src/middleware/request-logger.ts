import { logger } from '../utils/logger.js';
import type { Context, Next } from 'hono';

export async function requestLogger(c: Context, next: Next): Promise<void> {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  logger.info({
    method,
    path,
    status,
    duration: `${duration}ms`,
    userAgent: c.req.header('user-agent')?.slice(0, 50),
  }, `${method} ${path} ${status} ${duration}ms`);
}
