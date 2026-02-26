import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { serve } from '@hono/node-server';
import type { ApiResponse } from '@vibebetter/shared';
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

app.get('/health', (c) => {
  return c.json<ApiResponse<{ status: string; timestamp: string }>>({
    success: true,
    data: { status: 'ok', timestamp: new Date().toISOString() },
    error: null,
  });
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

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  logger.info(`VibeBetter server running on http://localhost:${info.port}`);
});

export default app;
