import type { Context, Next } from 'hono';

const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimiter(opts: { windowMs: number; max: number }) {
  return async (c: Context, next: Next) => {
    const key = c.req.header('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    const entry = store.get(key);
    if (entry && entry.resetAt > now) {
      if (entry.count >= opts.max) {
        return c.json(
          { success: false, data: null, error: 'Too many requests' },
          429,
        );
      }
      entry.count++;
    } else {
      store.set(key, { count: 1, resetAt: now + opts.windowMs });
    }
    await next();
  };
}
