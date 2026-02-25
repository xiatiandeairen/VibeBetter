import type { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import type { AuthTokenPayload } from '@vibebetter/shared';
import { env } from '../config/env.js';

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthTokenPayload;
  }
}

export async function authMiddleware(c: Context, next: Next): Promise<Response | void> {
  const header = c.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return c.json(
      { success: false, data: null, error: 'Missing or invalid Authorization header' },
      401,
    );
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ success: false, data: null, error: 'Invalid or expired token' }, 401);
  }
}
