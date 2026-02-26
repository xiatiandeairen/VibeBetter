import { createMiddleware } from 'hono/factory';

export const requestIdMiddleware = createMiddleware(async (c, next) => {
  const existing = c.req.header('X-Request-Id');
  const requestId = existing || crypto.randomUUID();
  c.set('requestId', requestId);
  c.header('X-Request-Id', requestId);
  await next();
});
