import type { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { AuthTokenPayload } from '@vibebetter/shared';
import { prisma } from '@vibebetter/db';
import { env } from '../config/env.js';

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthTokenPayload;
  }
}

export async function authMiddleware(c: Context, next: Next): Promise<Response | void> {
  const apiKey = c.req.header('X-API-Key');
  if (apiKey) {
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const key = await prisma.apiKey.findUnique({ where: { keyHash }, include: { user: true } });
    if (key) {
      await prisma.apiKey.update({ where: { id: key.id }, data: { lastUsed: new Date() } });
      c.set('user', { userId: key.user.id, email: key.user.email, role: key.user.role });
      await next();
      return;
    }
  }

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
