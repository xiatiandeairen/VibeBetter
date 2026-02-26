import { logger } from './logger.js';

export interface CatalogEntry {
  code: string;
  httpStatus: number;
  message: string;
  description: string;
  docsUrl: string;
  resolution: string;
}

const BASE_DOCS_URL = 'https://docs.vibebetter.dev/errors';

const CATALOG: Record<string, CatalogEntry> = {
  VB1001: {
    code: 'VB1001',
    httpStatus: 400,
    message: 'Invalid project ID',
    description: 'The provided project ID is missing or malformed.',
    docsUrl: `${BASE_DOCS_URL}/VB1001`,
    resolution: 'Ensure project ID is a non-empty string and matches your configuration.',
  },
  VB1002: {
    code: 'VB1002',
    httpStatus: 401,
    message: 'Authentication required',
    description: 'The request lacks valid authentication credentials.',
    docsUrl: `${BASE_DOCS_URL}/VB1002`,
    resolution: 'Include a valid API key in the Authorization header.',
  },
  VB1003: {
    code: 'VB1003',
    httpStatus: 403,
    message: 'Insufficient permissions',
    description: 'The authenticated user does not have permission for this action.',
    docsUrl: `${BASE_DOCS_URL}/VB1003`,
    resolution: 'Check your role and ensure the required scope is granted.',
  },
  VB1004: {
    code: 'VB1004',
    httpStatus: 404,
    message: 'Resource not found',
    description: 'The requested resource does not exist.',
    docsUrl: `${BASE_DOCS_URL}/VB1004`,
    resolution: 'Verify the resource ID and endpoint path.',
  },
  VB1005: {
    code: 'VB1005',
    httpStatus: 409,
    message: 'Conflict — duplicate resource',
    description: 'A resource with the same unique identifier already exists.',
    docsUrl: `${BASE_DOCS_URL}/VB1005`,
    resolution: 'Use a different identifier or update the existing resource.',
  },
  VB1006: {
    code: 'VB1006',
    httpStatus: 422,
    message: 'Validation failed',
    description: 'The request body failed schema validation.',
    docsUrl: `${BASE_DOCS_URL}/VB1006`,
    resolution: 'Review the error details and correct the request payload.',
  },
  VB1007: {
    code: 'VB1007',
    httpStatus: 429,
    message: 'Rate limit exceeded',
    description: 'Too many requests in the current time window.',
    docsUrl: `${BASE_DOCS_URL}/VB1007`,
    resolution: 'Wait for the X-RateLimit-Reset header value before retrying.',
  },
  VB1008: {
    code: 'VB1008',
    httpStatus: 500,
    message: 'Internal server error',
    description: 'An unexpected error occurred on the server.',
    docsUrl: `${BASE_DOCS_URL}/VB1008`,
    resolution: 'Retry the request. If the issue persists, contact support with the X-Request-Id.',
  },
  VB1009: {
    code: 'VB1009',
    httpStatus: 503,
    message: 'Service unavailable',
    description: 'The service is temporarily unavailable (maintenance or overload).',
    docsUrl: `${BASE_DOCS_URL}/VB1009`,
    resolution: 'Retry after a short delay. Check the status page for incidents.',
  },
  VB1010: {
    code: 'VB1010',
    httpStatus: 504,
    message: 'Gateway timeout',
    description: 'An upstream service did not respond in time.',
    docsUrl: `${BASE_DOCS_URL}/VB1010`,
    resolution: 'Retry the request. If upstream is consistently slow, check infrastructure health.',
  },
};

export function lookupError(code: string): CatalogEntry | undefined {
  return CATALOG[code];
}

export function allErrors(): CatalogEntry[] {
  return Object.values(CATALOG);
}

export function formatErrorResponse(code: string, detail?: string): Record<string, unknown> {
  const entry = CATALOG[code];
  if (!entry) {
    logger.warn({ code }, 'Unknown error code requested');
    return { error: 'UNKNOWN', message: 'An unknown error occurred' };
  }
  return {
    error: entry.code,
    message: entry.message,
    detail: detail ?? entry.description,
    docsUrl: entry.docsUrl,
  };
}

export { CATALOG as ERROR_CATALOG };
