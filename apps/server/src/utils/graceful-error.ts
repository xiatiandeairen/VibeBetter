import type { Context, Next } from 'hono';
import { logger } from './logger.js';

export interface AppError {
  statusCode: number;
  message: string;
  code: string;
  details?: unknown;
}

export function createAppError(statusCode: number, message: string, code: string, details?: unknown): AppError {
  return { statusCode, message, code, details };
}

export function isAppError(err: unknown): err is AppError {
  return typeof err === 'object' && err !== null && 'statusCode' in err && 'code' in err;
}

type AsyncHandler = (c: Context) => Promise<Response>;

export function wrapAsync(handler: AsyncHandler): (c: Context) => Promise<Response> {
  return async (c: Context) => {
    try {
      return await handler(c);
    } catch (err) {
      if (isAppError(err)) {
        logger.warn({ code: err.code, statusCode: err.statusCode, details: err.details }, err.message);
        return c.json({ error: err.message, code: err.code, details: err.details ?? null }, err.statusCode as 400);
      }

      const message = err instanceof Error ? err.message : 'Internal server error';
      const stack = err instanceof Error ? err.stack : undefined;
      logger.error({ err: message, stack }, 'Unhandled route error');
      return c.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, 500);
    }
  };
}

export function errorMiddleware() {
  return async (c: Context, next: Next) => {
    try {
      await next();
    } catch (err) {
      if (isAppError(err)) {
        return c.json({ error: err.message, code: err.code, details: err.details ?? null }, err.statusCode as 400);
      }

      const message = err instanceof Error ? err.message : 'Internal server error';
      logger.error({ err: message }, 'Unhandled middleware error');
      return c.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, 500);
    }
  };
}

export const notFound = createAppError(404, 'Resource not found', 'NOT_FOUND');
export const unauthorized = createAppError(401, 'Authentication required', 'UNAUTHORIZED');
export const forbidden = createAppError(403, 'Access denied', 'FORBIDDEN');
export const badRequest = (message: string) => createAppError(400, message, 'BAD_REQUEST');
export const conflict = (message: string) => createAppError(409, message, 'CONFLICT');
