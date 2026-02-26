import { Hono } from 'hono';
import { MetricsQuerySchema } from '@vibebetter/shared';
import type { ApiResponse, MetricResult } from '@vibebetter/shared';
import { prisma } from '@vibebetter/db';
import { authMiddleware } from '../../middleware/auth.js';
import { metricsService } from '../../services/metrics.service.js';
import { attributionService } from '../../services/attribution.service.js';
import { logger } from '../../utils/logger.js';
import { getCached, invalidateCache } from '../../utils/cache.js';

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

    const result = await getCached<MetricResult>(
      `metrics:overview:${projectId}`,
      300,
      async () => {
        const latest = await prisma.metricSnapshot.findFirst({
          where: { projectId },
          orderBy: { snapshotDate: 'desc' },
        });

        if (!latest) {
          return {
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
          };
        }

        return {
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
      },
    );

    return c.json<ApiResponse<MetricResult>>({ success: true, data: result, error: null });
  } catch (err) {
    logger.error({ err }, 'Metrics overview error');
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
    logger.error({ err }, 'Snapshots error');
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

    const limitParam = c.req.query('limit');
    const limit = limitParam ? parseInt(limitParam) : 10;
    const sort = c.req.query('sort') || 'default';

    const topFiles = await metricsService.getTopFiles(projectId, limit, sort);
    return c.json<ApiResponse<typeof topFiles>>({ success: true, data: topFiles, error: null });
  } catch (err) {
    logger.error({ err }, 'Top files error');
    return c.json<ApiResponse>({ success: false, data: null, error: 'Internal server error' }, 500);
  }
});

metrics.get('/projects/:id/recent-prs', async (c) => {
  try {
    const projectId = c.req.param('id');
    const { userId } = c.get('user');
    const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: userId } });
    if (!project) {
      return c.json<ApiResponse>({ success: false, data: null, error: 'Not found' }, 404);
    }

    const limit = parseInt(c.req.query('limit') ?? '5');
    const prs = await prisma.pullRequest.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, number: true, title: true, aiUsed: true, state: true, createdAt: true },
    });
    return c.json({ success: true, data: prs, error: null });
  } catch (err) {
    logger.error({ err }, 'Recent PRs error');
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
    await invalidateCache(`metrics:*:${projectId}`);
    return c.json<ApiResponse<MetricResult>>({ success: true, data: result, error: null }, 201);
  } catch (err) {
    logger.error({ err }, 'Compute metrics error');
    return c.json<ApiResponse>({ success: false, data: null, error: 'Internal server error' }, 500);
  }
});

metrics.get('/projects/:id/prs', async (c) => {
  try {
    const projectId = c.req.param('id');
    const { userId } = c.get('user');
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });
    if (!project) {
      return c.json({ success: false, data: null, error: 'Not found' }, 404);
    }
    const prs = await prisma.pullRequest.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    return c.json({ success: true, data: prs, error: null });
  } catch (err) {
    logger.error({ err }, 'Get all PRs error');
    return c.json<ApiResponse>(
      { success: false, data: null, error: 'Internal server error' },
      500,
    );
  }
});

metrics.get('/projects/:id/export', async (c) => {
  try {
    const projectId = c.req.param('id');
    const { userId } = c.get('user');
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });
    if (!project) {
      return c.json({ success: false, data: null, error: 'Not found' }, 404);
    }

    const format = c.req.query('format') || 'json';
    const snapshots = await prisma.metricSnapshot.findMany({
      where: { projectId },
      orderBy: { snapshotDate: 'desc' },
    });

    if (format === 'csv') {
      if (snapshots.length === 0) {
        c.header('Content-Type', 'text/csv');
        c.header(
          'Content-Disposition',
          `attachment; filename="${project.name}-metrics.csv"`,
        );
        return c.text('');
      }
      const headers = Object.keys(snapshots[0]!).join(',');
      const rows = snapshots.map((s) =>
        Object.values(s)
          .map((v) =>
            v instanceof Date ? v.toISOString() : String(v ?? ''),
          )
          .join(','),
      );
      const csv = [headers, ...rows].join('\n');
      c.header('Content-Type', 'text/csv');
      c.header(
        'Content-Disposition',
        `attachment; filename="${project.name}-metrics.csv"`,
      );
      return c.text(csv);
    }

    return c.json({ success: true, data: snapshots, error: null });
  } catch (err) {
    logger.error({ err }, 'Export error');
    return c.json<ApiResponse>(
      { success: false, data: null, error: 'Internal server error' },
      500,
    );
  }
});

metrics.get('/projects/:id/attribution', async (c) => {
  try {
    const projectId = c.req.param('id');
    const { userId } = c.get('user');
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });
    if (!project) {
      return c.json(
        { success: false, data: null, error: 'Not found' },
        404,
      );
    }
    const data = await attributionService.getAiAttribution(projectId);
    return c.json({ success: true, data, error: null });
  } catch (err) {
    logger.error({ err }, 'Attribution error');
    return c.json<ApiResponse>(
      { success: false, data: null, error: 'Internal server error' },
      500,
    );
  }
});

metrics.get('/projects/:id/failed-prs', async (c) => {
  try {
    const projectId = c.req.param('id');
    const { userId } = c.get('user');
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });
    if (!project) {
      return c.json(
        { success: false, data: null, error: 'Not found' },
        404,
      );
    }
    const data = await attributionService.getFailedPrAttribution(projectId);
    return c.json({ success: true, data, error: null });
  } catch (err) {
    logger.error({ err }, 'Failed PRs error');
    return c.json<ApiResponse>(
      { success: false, data: null, error: 'Internal server error' },
      500,
    );
  }
});

metrics.get('/projects/:id/developers', async (c) => {
  try {
    const projectId = c.req.param('id');
    const { userId } = c.get('user');
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });
    if (!project) {
      return c.json(
        { success: false, data: null, error: 'Not found' },
        404,
      );
    }

    const prs = await prisma.pullRequest.findMany({ where: { projectId } });
    const devMap = new Map<
      string,
      { total: number; ai: number; merged: number; rollback: number }
    >();

    for (const pr of prs) {
      const dev = devMap.get(pr.authorLogin) || {
        total: 0,
        ai: 0,
        merged: 0,
        rollback: 0,
      };
      dev.total++;
      if (pr.aiUsed) dev.ai++;
      if (pr.mergedAt) dev.merged++;
      if (pr.rollbackFlag) dev.rollback++;
      devMap.set(pr.authorLogin, dev);
    }

    const developers = Array.from(devMap.entries())
      .map(([login, stats]) => ({
        login,
        totalPrs: stats.total,
        aiPrs: stats.ai,
        aiUsageRate: stats.total > 0 ? stats.ai / stats.total : 0,
        mergeRate: stats.total > 0 ? stats.merged / stats.total : 0,
        rollbackRate: stats.total > 0 ? stats.rollback / stats.total : 0,
      }))
      .sort((a, b) => b.totalPrs - a.totalPrs);

    return c.json({ success: true, data: developers, error: null });
  } catch (err) {
    logger.error({ err }, 'Developers error');
    return c.json<ApiResponse>(
      { success: false, data: null, error: 'Internal server error' },
      500,
    );
  }
});

export default metrics;
