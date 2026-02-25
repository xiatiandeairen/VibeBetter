import { Hono } from 'hono';
import type { ApiResponse } from '@vibebetter/shared';
import { prisma } from '@vibebetter/db';
import { authMiddleware } from '../../middleware/auth.js';
import { enqueueCollectionJob } from '../../jobs/scheduler.js';

const collectors = new Hono();

collectors.use('*', authMiddleware);

collectors.post('/projects/:id/collect', async (c) => {
  try {
    const projectId = c.req.param('id');
    const { userId } = c.get('user');

    const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: userId } });
    if (!project) {
      return c.json<ApiResponse>({ success: false, data: null, error: 'Project not found' }, 404);
    }

    const job = await enqueueCollectionJob(projectId);
    return c.json<ApiResponse<{ jobId: string }>>(
      { success: true, data: { jobId: job.id ?? 'unknown' }, error: null },
      202,
    );
  } catch (err) {
    console.error('Collect error:', err);
    return c.json<ApiResponse>({ success: false, data: null, error: 'Internal server error' }, 500);
  }
});

collectors.get('/projects/:id/jobs', async (c) => {
  try {
    const projectId = c.req.param('id');
    const { userId } = c.get('user');

    const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: userId } });
    if (!project) {
      return c.json<ApiResponse>({ success: false, data: null, error: 'Project not found' }, 404);
    }

    const jobs = await prisma.collectionJob.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return c.json<ApiResponse<typeof jobs>>({ success: true, data: jobs, error: null });
  } catch (err) {
    console.error('List jobs error:', err);
    return c.json<ApiResponse>({ success: false, data: null, error: 'Internal server error' }, 500);
  }
});

export default collectors;
