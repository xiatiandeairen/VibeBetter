import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { RegisterInput, LoginInput, AuthTokenPayload } from '@vibebetter/shared';
import { prisma } from '@vibebetter/db';
import { env } from '../config/env.js';
import { AppError } from '../middleware/error-handler.js';

function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}

export class AuthService {
  async register(input: RegisterInput): Promise<{
    token: string;
    user: { id: string; email: string; name: string; role: string };
  }> {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw AppError.conflict('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
      data: { email: input.email, name: input.name, password: hashedPassword },
    });

    const tokenPayload: AuthTokenPayload = { userId: user.id, email: user.email, role: user.role };
    const token = signToken(tokenPayload);

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  async login(input: LoginInput): Promise<{
    token: string;
    user: { id: string; email: string; name: string; role: string };
  }> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw AppError.unauthorized('Invalid credentials');
    }

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      throw AppError.unauthorized('Invalid credentials');
    }

    const tokenPayload: AuthTokenPayload = { userId: user.id, email: user.email, role: user.role };
    const token = signToken(tokenPayload);

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  async getUser(userId: string): Promise<{
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: Date;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return user;
  }
}

export const authService = new AuthService();
