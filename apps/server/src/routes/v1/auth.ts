import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RegisterSchema, LoginSchema } from '@vibebetter/shared';
import type { AuthTokenPayload, ApiResponse } from '@vibebetter/shared';
import { prisma } from '@vibebetter/db';
import { env } from '../../config/env.js';
import { authMiddleware } from '../../middleware/auth.js';

const auth = new Hono();

function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}

auth.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return c.json<ApiResponse>(
        { success: false, data: null, error: parsed.error.errors.map((e) => e.message).join(', ') },
        400,
      );
    }

    const { email, name, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return c.json<ApiResponse>({ success: false, data: null, error: 'Email already registered' }, 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword },
    });

    const tokenPayload: AuthTokenPayload = { userId: user.id, email: user.email, role: user.role };
    const token = signToken(tokenPayload);

    return c.json<ApiResponse<{ token: string; user: { id: string; email: string; name: string; role: string } }>>(
      {
        success: true,
        data: { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } },
        error: null,
      },
      201,
    );
  } catch (err) {
    console.error('Register error:', err);
    return c.json<ApiResponse>({ success: false, data: null, error: 'Internal server error' }, 500);
  }
});

auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return c.json<ApiResponse>(
        { success: false, data: null, error: parsed.error.errors.map((e) => e.message).join(', ') },
        400,
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return c.json<ApiResponse>({ success: false, data: null, error: 'Invalid credentials' }, 401);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return c.json<ApiResponse>({ success: false, data: null, error: 'Invalid credentials' }, 401);
    }

    const tokenPayload: AuthTokenPayload = { userId: user.id, email: user.email, role: user.role };
    const token = signToken(tokenPayload);

    return c.json<ApiResponse<{ token: string; user: { id: string; email: string; name: string; role: string } }>>({
      success: true,
      data: { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } },
      error: null,
    });
  } catch (err) {
    console.error('Login error:', err);
    return c.json<ApiResponse>({ success: false, data: null, error: 'Internal server error' }, 500);
  }
});

auth.get('/me', authMiddleware, async (c) => {
  try {
    const { userId } = c.get('user');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) {
      return c.json<ApiResponse>({ success: false, data: null, error: 'User not found' }, 404);
    }

    return c.json<ApiResponse<typeof user>>({ success: true, data: user, error: null });
  } catch (err) {
    console.error('Me error:', err);
    return c.json<ApiResponse>({ success: false, data: null, error: 'Internal server error' }, 500);
  }
});

export default auth;
