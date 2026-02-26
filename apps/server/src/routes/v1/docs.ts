import { Hono } from 'hono';

const docs = new Hono();

const OPENAPI_SPEC = {
  openapi: '3.0.3',
  info: { title: 'VibeBetter API', version: '0.6.0', description: 'AI-Augmented Engineering Insight Platform API' },
  servers: [{ url: '/api/v1', description: 'API v1' }],
  paths: {
    '/auth/register': { post: { summary: 'Register', tags: ['Auth'], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, name: { type: 'string' }, password: { type: 'string' } } } } } }, responses: { '201': { description: 'User created' } } } },
    '/auth/login': { post: { summary: 'Login', tags: ['Auth'], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } } } }, responses: { '200': { description: 'JWT token' } } } },
    '/auth/me': { get: { summary: 'Current user', tags: ['Auth'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'User info' } } } },
    '/projects': { get: { summary: 'List projects', tags: ['Projects'], security: [{ bearerAuth: [] }] }, post: { summary: 'Create project', tags: ['Projects'], security: [{ bearerAuth: [] }] } },
    '/metrics/projects/{id}/overview': { get: { summary: 'Metrics overview', tags: ['Metrics'], security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }] } },
    '/metrics/projects/{id}/snapshots': { get: { summary: 'Metric snapshots', tags: ['Metrics'], security: [{ bearerAuth: [] }] } },
    '/metrics/projects/{id}/compute': { post: { summary: 'Compute metrics', tags: ['Metrics'], security: [{ bearerAuth: [] }] } },
    '/metrics/projects/{id}/attribution': { get: { summary: 'AI attribution analysis', tags: ['Metrics'], security: [{ bearerAuth: [] }] } },
    '/metrics/projects/{id}/developers': { get: { summary: 'Developer effectiveness', tags: ['Metrics'], security: [{ bearerAuth: [] }] } },
    '/metrics/projects/{id}/export': { get: { summary: 'Export data (CSV/JSON)', tags: ['Metrics'], security: [{ bearerAuth: [] }], parameters: [{ name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'csv'] } }] } },
    '/decisions/projects/{id}/decisions': { get: { summary: 'List decisions', tags: ['Decisions'], security: [{ bearerAuth: [] }] } },
    '/decisions/projects/{id}/decisions/generate': { post: { summary: 'Generate decisions', tags: ['Decisions'], security: [{ bearerAuth: [] }] } },
    '/weights/projects/{id}/weights': { get: { summary: 'Get PSRI weights', tags: ['Weights'], security: [{ bearerAuth: [] }] }, put: { summary: 'Update weights', tags: ['Weights'], security: [{ bearerAuth: [] }] } },
    '/behaviors/projects/{id}/ai-behaviors/stats': { get: { summary: 'AI behavior stats', tags: ['Behaviors'], security: [{ bearerAuth: [] }] } },
    '/collectors/projects/{id}/collect': { post: { summary: 'Trigger collection', tags: ['Collectors'], security: [{ bearerAuth: [] }] } },
    '/webhooks/github': { post: { summary: 'GitHub webhook', tags: ['Webhooks'] } },
  },
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
};

docs.get('/openapi.json', (c) => c.json(OPENAPI_SPEC));

docs.get('/', (c) => {
  const html = `<!DOCTYPE html>
<html><head><title>VibeBetter API Docs</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
</head><body>
<div id="swagger-ui"></div>
<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>SwaggerUIBundle({ url: '/api/v1/docs/openapi.json', dom_id: '#swagger-ui' });</script>
</body></html>`;
  return c.html(html);
});

export default docs;
