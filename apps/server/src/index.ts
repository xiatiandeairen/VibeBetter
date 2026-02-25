import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import type { ApiResponse } from '@vibebetter/shared';
import { env } from './config/env.js';
import auth from './routes/v1/auth.js';
import projects from './routes/v1/projects.js';
import metrics from './routes/v1/metrics.js';
import collectors from './routes/v1/collectors.js';

const app = new Hono();

app.use('*', cors({ origin: '*' }));
app.use('*', logger());

app.get('/health', (c) => {
  return c.json<ApiResponse<{ status: string; timestamp: string }>>({
    success: true,
    data: { status: 'ok', timestamp: new Date().toISOString() },
    error: null,
  });
});

app.route('/api/v1/auth', auth);
app.route('/api/v1/projects', projects);
app.route('/api/v1/metrics', metrics);
app.route('/api/v1/collectors', collectors);

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`VibeBetter server running on http://localhost:${info.port}`);
});

export default app;
