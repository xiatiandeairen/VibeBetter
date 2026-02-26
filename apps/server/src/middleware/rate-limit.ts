import type { Context, Next } from 'hono';

const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimiter(opts: { windowMs: number; max: number }) {
  return async (c: Context, next: Next) => {
    const key = c.req.header('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    let entry = store.get(key);
    if (entry && entry.resetAt > now) {
      if (entry.count >= opts.max) {
        c.header('X-RateLimit-Limit', String(opts.max));
        c.header('X-RateLimit-Remaining', '0');
        c.header('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));
        return c.json(
          { success: false, data: null, error: 'Too many requests' },
          429,
        );
      }
      entry.count++;
    } else {
      entry = { count: 1, resetAt: now + opts.windowMs };
      store.set(key, entry);
    }
    await next();
    c.header('X-RateLimit-Limit', String(opts.max));
    c.header('X-RateLimit-Remaining', String(Math.max(0, opts.max - (entry?.count ?? 0))));
    c.header('X-RateLimit-Reset', String(Math.ceil((entry?.resetAt ?? Date.now()) / 1000)));
  };
}
