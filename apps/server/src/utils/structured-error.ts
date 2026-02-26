export interface ErrorMeta {
  code: string;
  httpStatus: number;
  docsUrl?: string;
  recovery?: string;
  retryable: boolean;
  context?: Record<string, unknown>;
}

export class StructuredError extends Error {
  readonly code: string;
  readonly httpStatus: number;
  readonly docsUrl?: string;
  readonly recovery?: string;
  readonly retryable: boolean;
  readonly context: Record<string, unknown>;
  readonly timestamp: Date;

  constructor(message: string, meta: ErrorMeta) {
    super(message);
    this.name = 'StructuredError';
    this.code = meta.code;
    this.httpStatus = meta.httpStatus;
    this.docsUrl = meta.docsUrl;
    this.recovery = meta.recovery;
    this.retryable = meta.retryable;
    this.context = meta.context ?? {};
    this.timestamp = new Date();
  }

  toJSON(): Record<string, unknown> {
    return {
      error: this.code,
      message: this.message,
      httpStatus: this.httpStatus,
      docsUrl: this.docsUrl,
      recovery: this.recovery,
      retryable: this.retryable,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

export const Errors = {
  notFound(resource: string, id: string): StructuredError {
    return new StructuredError(`${resource} with id "${id}" not found`, {
      code: 'RESOURCE_NOT_FOUND',
      httpStatus: 404,
      docsUrl: 'https://docs.vibebetter.dev/errors/not-found',
      recovery: `Verify the ${resource} ID is correct and you have access to it.`,
      retryable: false,
      context: { resource, id },
    });
  },

  unauthorized(reason?: string): StructuredError {
    return new StructuredError(reason ?? 'Authentication required', {
      code: 'UNAUTHORIZED',
      httpStatus: 401,
      docsUrl: 'https://docs.vibebetter.dev/errors/auth',
      recovery: 'Provide a valid API key or authentication token.',
      retryable: false,
    });
  },

  forbidden(action: string, resource: string): StructuredError {
    return new StructuredError(`Not allowed to ${action} on ${resource}`, {
      code: 'FORBIDDEN',
      httpStatus: 403,
      docsUrl: 'https://docs.vibebetter.dev/errors/permissions',
      recovery: 'Request access from your organization admin.',
      retryable: false,
      context: { action, resource },
    });
  },

  rateLimited(retryAfterMs: number): StructuredError {
    return new StructuredError('Rate limit exceeded', {
      code: 'RATE_LIMITED',
      httpStatus: 429,
      docsUrl: 'https://docs.vibebetter.dev/errors/rate-limit',
      recovery: `Wait ${Math.ceil(retryAfterMs / 1000)} seconds before retrying.`,
      retryable: true,
      context: { retryAfterMs },
    });
  },

  validation(field: string, reason: string): StructuredError {
    return new StructuredError(`Validation failed for "${field}": ${reason}`, {
      code: 'VALIDATION_ERROR',
      httpStatus: 400,
      docsUrl: 'https://docs.vibebetter.dev/errors/validation',
      recovery: `Check the value of "${field}" and try again.`,
      retryable: false,
      context: { field, reason },
    });
  },

  internal(detail?: string): StructuredError {
    return new StructuredError(detail ?? 'Internal server error', {
      code: 'INTERNAL_ERROR',
      httpStatus: 500,
      docsUrl: 'https://docs.vibebetter.dev/errors/internal',
      recovery: 'This is a server-side issue. Please try again later or contact support.',
      retryable: true,
    });
  },

  timeout(operation: string, durationMs: number): StructuredError {
    return new StructuredError(`Operation "${operation}" timed out after ${durationMs}ms`, {
      code: 'TIMEOUT',
      httpStatus: 504,
      docsUrl: 'https://docs.vibebetter.dev/errors/timeout',
      recovery: 'Try again with a smaller scope or contact support for large operations.',
      retryable: true,
      context: { operation, durationMs },
    });
  },
} as const;
