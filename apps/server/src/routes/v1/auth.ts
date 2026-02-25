import { Hono } from 'hono';
import { RegisterSchema, LoginSchema } from '@vibebetter/shared';
import type { ApiResponse } from '@vibebetter/shared';
import { authMiddleware } from '../../middleware/auth.js';
import { authService } from '../../services/auth.service.js';
import { AppError } from '../../middleware/error-handler.js';

const auth = new Hono();

auth.post('/register', async (c) => {
  const body = await c.req.json();
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(parsed.error.errors.map((e) => e.message).join(', '));
  }

  const result = await authService.register(parsed.data);
  return c.json<ApiResponse<typeof result>>({ success: true, data: result, error: null }, 201);
});

auth.post('/login', async (c) => {
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

export default auth;
