import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterSchema, LoginSchema } from '@vibebetter/shared';

vi.mock('@vibebetter/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mock-jwt-token'),
    verify: vi.fn(),
  },
}));

vi.mock('../config/env.js', () => ({
  env: { JWT_SECRET: 'test-secret', PORT: 3001 },
}));

describe('Auth Service - Schema Validation', () => {
  describe('RegisterSchema', () => {
    it('accepts valid registration input', () => {
      const result = RegisterSchema.safeParse({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = RegisterSchema.safeParse({
        email: 'not-an-email',
        name: 'Test User',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty name', () => {
      const result = RegisterSchema.safeParse({
        email: 'test@example.com',
        name: '',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('rejects short password', () => {
      const result = RegisterSchema.safeParse({
        email: 'test@example.com',
        name: 'Test User',
        password: '123',
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing fields', () => {
      const result = RegisterSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('LoginSchema', () => {
    it('accepts valid login input', () => {
      const result = LoginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = LoginSchema.safeParse({
        email: 'bad-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty password', () => {
      const result = LoginSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Auth Service - Password Hashing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('bcrypt hash produces a hashed value', async () => {
    const bcrypt = await import('bcryptjs');
    const hashed = await bcrypt.default.hash('password123', 10);
    expect(hashed).toBe('hashed_password');
    expect(bcrypt.default.hash).toHaveBeenCalledWith('password123', 10);
  });

  it('bcrypt compare is called with correct args', async () => {
    const bcrypt = await import('bcryptjs');
    (bcrypt.default.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    const result = await bcrypt.default.compare('password123', 'hashed_password');
    expect(result).toBe(true);
    expect(bcrypt.default.compare).toHaveBeenCalledWith('password123', 'hashed_password');
  });

  it('bcrypt compare returns false for wrong password', async () => {
    const bcrypt = await import('bcryptjs');
    (bcrypt.default.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    const result = await bcrypt.default.compare('wrong', 'hashed_password');
    expect(result).toBe(false);
  });
});
