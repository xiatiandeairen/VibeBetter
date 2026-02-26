import { Hono } from 'hono';
import { prisma } from '@vibebetter/db';
import { logger } from '../../utils/logger.js';
import { enqueueCollectionJob } from '../../jobs/scheduler.js';
import { metricsService } from '../../services/metrics.service.js';

const webhooks = new Hono();

webhooks.post('/github', async (c) => {
  const event = c.req.header('X-GitHub-Event');
  const signature = c.req.header('X-Hub-Signature-256');

  logger.info({ event, signature: signature ? 'present' : 'missing' }, 'Received GitHub webhook');

  const body = await c.req.json();

  if (event === 'pull_request') {
    const action = body.action as string | undefined;
    const repoUrl = body.repository?.html_url as string | undefined;

    if (!repoUrl) {
      return c.json({ success: false, error: 'Missing repository URL' }, 400);
    }

    const project = await prisma.project.findFirst({
      where: { repoUrl: { contains: repoUrl.replace('https://github.com/', '') } },
    });

    if (!project) {
      logger.warn({ repoUrl }, 'No project found for webhook repo');
      return c.json({ success: true, data: { message: 'No matching project' }, error: null });
    }

    logger.info({ projectId: project.id, action, prNumber: body.number }, 'Processing PR webhook');

    if (action === 'closed' && body.pull_request?.merged) {
      await enqueueCollectionJob(project.id);
      setTimeout(async () => {
        try {
          await metricsService.computeAndSaveSnapshot(project.id);
          logger.info({ projectId: project.id }, 'Metrics recomputed after PR merge');
        } catch (err) {
          logger.error({ err, projectId: project.id }, 'Failed to recompute metrics');
        }
      }, 5000);
    }

    return c.json({ success: true, data: { processed: true, action, projectId: project.id }, error: null });
  }

  if (event === 'push') {
    const repoUrl = body.repository?.html_url as string | undefined;
    const project = await prisma.project.findFirst({
      where: { repoUrl: { contains: repoUrl?.replace('https://github.com/', '') || '' } },
    });

    if (project) {
      logger.info({ projectId: project.id }, 'Push event received, enqueuing collection');
      await enqueueCollectionJob(project.id);
    }

    return c.json({ success: true, data: { processed: true }, error: null });
  }

  return c.json({ success: true, data: { event, processed: false }, error: null });
});

webhooks.get('/github/setup', async (c) => {
  const baseUrl = c.req.header('host') || 'localhost:3001';
  const protocol = c.req.header('x-forwarded-proto') || 'http';
  return c.json({
    success: true,
    data: {
      webhookUrl: `${protocol}://${baseUrl}/api/v1/webhooks/github`,
      events: ['pull_request', 'push'],
      contentType: 'application/json',
      instructions:
        'Add this URL as a webhook in your GitHub repository settings under Settings → Webhooks → Add webhook',
    },
    error: null,
  });
});

export default webhooks;
