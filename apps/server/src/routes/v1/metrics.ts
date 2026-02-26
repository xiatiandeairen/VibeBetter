import { Hono } from 'hono';
import { authMiddleware } from '../../middleware/auth.js';
import overview from './metrics/overview.js';
import files from './metrics/files.js';
import exportRoutes from './metrics/export.js';

const metrics = new Hono();

metrics.use('*', authMiddleware);

metrics.route('/', overview);
metrics.route('/', files);
metrics.route('/', exportRoutes);

export default metrics;
