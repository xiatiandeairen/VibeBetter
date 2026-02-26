import { cors } from 'hono/cors';

function parseOrigins(): string[] {
  const envOrigins = process.env.CORS_ORIGINS || process.env.ALLOWED_ORIGINS;
  if (envOrigins) {
    return envOrigins.split(',').map((o) => o.trim()).filter(Boolean);
  }

  const nodeEnv = process.env.NODE_ENV || 'development';
  if (nodeEnv === 'production') {
    const appUrl = process.env.APP_URL || 'https://app.vibebetter.com';
    return [appUrl];
  }

  return ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'];
}

export function createCorsMiddleware() {
  const origins = parseOrigins();

  return cors({
    origin: (origin) => {
      if (!origin) return origins[0] || '*';
      if (origins.includes(origin)) return origin;
      if (origins.includes('*')) return origin;
      return null as unknown as string;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-Id'],
    exposeHeaders: ['X-Request-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    credentials: true,
    maxAge: 86400,
  });
}

export function getCorsOrigins(): string[] {
  return parseOrigins();
}
