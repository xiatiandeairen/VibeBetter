import { Hono } from 'hono';
import crypto from 'crypto';
import { RegisterSchema, LoginSchema } from '@vibebetter/shared';
import type { ApiResponse } from '@vibebetter/shared';
import { prisma } from '@vibebetter/db';
import { authMiddleware } from '../../middleware/auth.js';
import { authService } from '../../services/auth.service.js';
import { AppError } from '../../middleware/error-handler.js';
import { rateLimiter } from '../../middleware/rate-limit.js';

const auth = new Hono();

const authRateLimit = rateLimiter({ windowMs: 60_000, max: 10 });

auth.post('/register', authRateLimit, async (c) => {
  const body = await c.req.json();
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(parsed.error.errors.map((e) => e.message).join(', '));
  }

  const result = await authService.register(parsed.data);
  return c.json<ApiResponse<typeof result>>({ success: true, data: result, error: null }, 201);
});

auth.post('/login', authRateLimit, async (c) => {
  const body = await c.req.json();
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(parsed.error.errors.map((e) => e.message).join(', '));
  }

  const result = await authService.login(parsed.data);
  return c.json<ApiResponse<typeof result>>({ success: true, data: result, error: null });
});

auth.get('/me', authMiddleware, async (c) => {
  const { userId } = c.get('user');
  const user = await authService.getUser(userId);
  return c.json<ApiResponse<typeof user>>({ success: true, data: user, error: null });
});

auth.post('/api-keys', authMiddleware, async (c) => {
  const { userId } = c.get('user');
  const body = await c.req.json();
  const name = (body.name as string) || 'Untitled Key';

  const rawKey = `vb_${crypto.randomBytes(32).toString('hex')}`;
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const prefix = rawKey.slice(0, 10);

  const apiKey = await prisma.apiKey.create({
    data: { userId, name, keyHash, prefix },
  });

  return c.json<ApiResponse<{ id: string; name: string; prefix: string; key: string; createdAt: Date }>>({
    success: true,
    data: { id: apiKey.id, name: apiKey.name, prefix: apiKey.prefix, key: rawKey, createdAt: apiKey.createdAt },
    error: null,
  }, 201);
});

auth.get('/api-keys', authMiddleware, async (c) => {
  const { userId } = c.get('user');
  const keys = await prisma.apiKey.findMany({
    where: { userId },
    select: { id: true, name: true, prefix: true, lastUsed: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  return c.json<ApiResponse<typeof keys>>({ success: true, data: keys, error: null });
});

auth.delete('/api-keys/:id', authMiddleware, async (c) => {
  const { userId } = c.get('user');
  const keyId = c.req.param('id');

  const key = await prisma.apiKey.findFirst({ where: { id: keyId, userId } });
  if (!key) {
    throw AppError.notFound('API key not found');
  }

  await prisma.apiKey.delete({ where: { id: keyId } });
  return c.json<ApiResponse<null>>({ success: true, data: null, error: null });
});

export default auth;
