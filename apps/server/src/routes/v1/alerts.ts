import { Hono } from 'hono';
import { prisma } from '@vibebetter/db';
import { authMiddleware } from '../../middleware/auth.js';
import { requireProject } from '../../middleware/require-project.js';

const alerts = new Hono();
alerts.use('*', authMiddleware);

alerts.get('/projects/:id/alerts', requireProject(), async (c) => {
  const project = c.get('project') as { id: string };
  const configs = await prisma.alertConfig.findMany({ where: { projectId: project.id } });
  return c.json({ success: true, data: configs, error: null });
});

alerts.post('/projects/:id/alerts', requireProject(), async (c) => {
  const project = c.get('project') as { id: string };
  const body = await c.req.json();
  const config = await prisma.alertConfig.create({
    data: { projectId: project.id, metric: body.metric, operator: body.operator, threshold: body.threshold, channel: body.channel || 'in_app' },
  });
  return c.json({ success: true, data: config, error: null }, 201);
});

alerts.delete('/projects/:id/alerts/:alertId', requireProject(), async (c) => {
  const alertId = c.req.param('alertId');
  await prisma.alertConfig.delete({ where: { id: alertId } });
  return c.json({ success: true, data: { deleted: true }, error: null });
});

export default alerts;
