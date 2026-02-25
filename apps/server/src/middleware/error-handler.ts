import type { ErrorHandler } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { ApiResponse } from '@vibebetter/shared';
import { ZodError } from 'zod';
import { Prisma } from '@vibebetter/db';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;

  constructor(message: string, statusCode: number, errorCode: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }

  static notFound(message = 'Resource not found'): AppError {
    return new AppError(message, 404, 'NOT_FOUND');
  }

  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(message, 403, 'FORBIDDEN');
  }

  static badRequest(message = 'Bad request'): AppError {
    return new AppError(message, 400, 'BAD_REQUEST');
  }

  static conflict(message = 'Conflict'): AppError {
    return new AppError(message, 409, 'CONFLICT');
  }
}

export const onError: ErrorHandler = (err, c) => {
  console.error('Unhandled error:', err);

  if (err instanceof AppError) {
    return c.json<ApiResponse>(
      { success: false, data: null, error: err.message },
      err.statusCode as ContentfulStatusCode,
    );
  }

  if (err instanceof ZodError) {
    const message = err.errors.map((e) => e.message).join(', ');
    return c.json<ApiResponse>({ success: false, data: null, error: message }, 400);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return c.json<ApiResponse>(
        { success: false, data: null, error: 'A record with this value already exists' },
        409,
      );
    }
    if (err.code === 'P2025') {
      return c.json<ApiResponse>(
        { success: false, data: null, error: 'Record not found' },
        404,
      );
    }
    return c.json<ApiResponse>(
      { success: false, data: null, error: 'Database error' },
      500,
    );
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return c.json<ApiResponse>(
      { success: false, data: null, error: 'Invalid data provided' },
      400,
    );
  }

  return c.json<ApiResponse>(
    { success: false, data: null, error: 'Internal server error' },
    500,
  );
};
