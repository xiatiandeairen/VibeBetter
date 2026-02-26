import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { serve } from '@hono/node-server';
import type { ApiResponse } from '@vibebetter/shared';
import { prisma } from '@vibebetter/db';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { onError } from './middleware/error-handler.js';
import auth from './routes/v1/auth.js';
import projects from './routes/v1/projects.js';
import metrics from './routes/v1/metrics.js';
import collectors from './routes/v1/collectors.js';
import weights from './routes/v1/weights.js';
import decisions from './routes/v1/decisions.js';
import behaviors from './routes/v1/behaviors.js';
import webhooks from './routes/v1/webhooks.js';
import oauth from './routes/v1/oauth.js';
import docs from './routes/v1/docs.js';
import admin from './routes/v1/admin.js';

const app = new Hono();

app.use(
  '*',
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.CORS_ORIGIN || '',
    ].filter(Boolean),
    credentials: true,
  }),
);
app.use('*', honoLogger());

app.onError(onError);

app.get('/health', async (c) => {
  const checks: Record<string, boolean> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch { checks.database = false; }

  try {
    const IORedis = (await import('ioredis')).default;
    const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { connectTimeout: 2000 });
    await redis.ping();
    await redis.quit();
    checks.redis = true;
  } catch { checks.redis = false; }

  const healthy = Object.values(checks).every(v => v);
  return c.json({
    success: true,
    data: { status: healthy ? 'healthy' : 'degraded', timestamp: new Date().toISOString(), checks },
    error: null,
  }, healthy ? 200 : 503);
});

app.route('/api/v1/webhooks', webhooks);
app.route('/api/v1/oauth', oauth);
app.route('/api/v1/auth', auth);
app.route('/api/v1/projects', projects);
app.route('/api/v1/metrics', metrics);
app.route('/api/v1/collectors', collectors);
app.route('/api/v1/weights', weights);
app.route('/api/v1/decisions', decisions);
app.route('/api/v1/behaviors', behaviors);
app.route('/api/v1/docs', docs);
app.route('/api/v1/admin', admin);

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  logger.info(`VibeBetter server running on http://localhost:${info.port}`);
});

export default app;
