import { Hono } from 'hono';
import type { ApiResponse } from '@vibebetter/shared';
import { prisma } from '@vibebetter/db';
import { authMiddleware } from '../../middleware/auth.js';
import { requireProject } from '../../middleware/require-project.js';
import { enqueueCollectionJob } from '../../jobs/scheduler.js';

const collectors = new Hono();

collectors.use('*', authMiddleware);

collectors.post('/projects/:id/collect', requireProject(), async (c) => {
  try {
    const project = c.get('project');

    const job = await enqueueCollectionJob(project.id);
    return c.json<ApiResponse<{ jobId: string }>>(
      { success: true, data: { jobId: job.id ?? 'unknown' }, error: null },
      202,
    );
  } catch (err) {
    console.error('Collect error:', err);
    return c.json<ApiResponse>({ success: false, data: null, error: 'Internal server error' }, 500);
  }
});

collectors.get('/projects/:id/jobs', requireProject(), async (c) => {
  try {
    const project = c.get('project');

    const jobs = await prisma.collectionJob.findMany({
      where: { projectId: project.id },
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
