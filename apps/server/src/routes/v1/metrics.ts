import { Hono } from 'hono';
import { MetricsQuerySchema } from '@vibebetter/shared';
import type { ApiResponse, MetricResult } from '@vibebetter/shared';
import { prisma } from '@vibebetter/db';
import { authMiddleware } from '../../middleware/auth.js';
import { metricsService } from '../../services/metrics.service.js';

const metrics = new Hono();

metrics.use('*', authMiddleware);

metrics.get('/projects/:id/overview', async (c) => {
  try {
    const projectId = c.req.param('id');
    const { userId } = c.get('user');

    const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: userId } });
    if (!project) {
      return c.json<ApiResponse>({ success: false, data: null, error: 'Project not found' }, 404);
    }

    const latest = await prisma.metricSnapshot.findFirst({
      where: { projectId },
      orderBy: { snapshotDate: 'desc' },
    });

    if (!latest) {
      return c.json<ApiResponse<MetricResult>>({
        success: true,
        data: {
          aiSuccessRate: null,
          aiStableRate: null,
          totalPrs: 0,
          aiPrs: 0,
          psriScore: null,
          psriStructural: null,
          psriChange: null,
          psriDefect: null,
          avgComplexity: null,
          tdiScore: null,
          totalFiles: 0,
          hotspotFiles: 0,
        },
        error: null,
      });
    }

    const result: MetricResult = {
      aiSuccessRate: latest.aiSuccessRate,
      aiStableRate: latest.aiStableRate,
      totalPrs: latest.totalPrs,
      aiPrs: latest.aiPrs,
      psriScore: latest.psriScore,
      psriStructural: latest.psriStructural,
      psriChange: latest.psriChange,
      psriDefect: latest.psriDefect,
      avgComplexity: latest.avgComplexity,
      tdiScore: latest.tdiScore,
      totalFiles: latest.totalFiles,
      hotspotFiles: latest.hotspotFiles,
    };

    return c.json<ApiResponse<MetricResult>>({ success: true, data: result, error: null });
  } catch (err) {
    console.error('Metrics overview error:', err);
    return c.json<ApiResponse>({ success: false, data: null, error: 'Internal server error' }, 500);
  }
});

metrics.get('/projects/:id/snapshots', async (c) => {
  try {
    const projectId = c.req.param('id');
    const { userId } = c.get('user');

    const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: userId } });
    if (!project) {
      return c.json<ApiResponse>({ success: false, data: null, error: 'Project not found' }, 404);
    }

    const query = MetricsQuerySchema.safeParse(c.req.query());
    if (!query.success) {
      return c.json<ApiResponse>(
        { success: false, data: null, error: query.error.errors.map((e) => e.message).join(', ') },
        400,
      );
    }

    const { from, to, limit } = query.data;

    const where: Record<string, unknown> = { projectId };
    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter['gte'] = new Date(from);
      if (to) dateFilter['lte'] = new Date(to);
      where['snapshotDate'] = dateFilter;
    }

    const snapshots = await prisma.metricSnapshot.findMany({
      where,
      orderBy: { snapshotDate: 'desc' },
      take: limit,
    });

    return c.json<ApiResponse<typeof snapshots>>({ success: true, data: snapshots, error: null });
  } catch (err) {
    console.error('Snapshots error:', err);
    return c.json<ApiResponse>({ success: false, data: null, error: 'Internal server error' }, 500);
  }
});

metrics.get('/projects/:id/files/top', async (c) => {
  try {
    const projectId = c.req.param('id');
    const { userId } = c.get('user');

    const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: userId } });
    if (!project) {
      return c.json<ApiResponse>({ success: false, data: null, error: 'Project not found' }, 404);
    }

    const topFiles = await metricsService.getTopFiles(projectId, 10);
    return c.json<ApiResponse<typeof topFiles>>({ success: true, data: topFiles, error: null });
  } catch (err) {
    console.error('Top files error:', err);
    return c.json<ApiResponse>({ success: false, data: null, error: 'Internal server error' }, 500);
  }
});

metrics.post('/projects/:id/compute', async (c) => {
  try {
    const projectId = c.req.param('id');
    const { userId } = c.get('user');

    const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: userId } });
    if (!project) {
      return c.json<ApiResponse>({ success: false, data: null, error: 'Project not found' }, 404);
    }

    const result = await metricsService.computeAndSaveSnapshot(projectId);
    return c.json<ApiResponse<MetricResult>>({ success: true, data: result, error: null }, 201);
  } catch (err) {
    console.error('Compute metrics error:', err);
    return c.json<ApiResponse>({ success: false, data: null, error: 'Internal server error' }, 500);
  }
});

export default metrics;
