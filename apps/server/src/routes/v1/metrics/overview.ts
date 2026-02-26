import { Hono } from 'hono';
import { MetricsQuerySchema } from '@vibebetter/shared';
import type { ApiResponse, MetricResult } from '@vibebetter/shared';
import { prisma } from '@vibebetter/db';
import { requireProject } from '../../../middleware/require-project.js';
import { metricsService } from '../../../services/metrics.service.js';
import { digestService } from '../../../services/digest.service.js';
import { logger } from '../../../utils/logger.js';
import { getCached, invalidateCache } from '../../../utils/cache.js';

const overview = new Hono();

overview.get('/projects/:id/overview', requireProject(), async (c) => {
  try {
    const project = c.get('project');

    const result = await getCached<MetricResult>(
      `metrics:overview:${project.id}`,
      300,
      async () => {
        const latest = await prisma.metricSnapshot.findFirst({
          where: { projectId: project.id },
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

overview.post('/projects/:id/compute', requireProject(), async (c) => {
  try {
    const project = c.get('project');

    const result = await metricsService.computeAndSaveSnapshot(project.id);
    await invalidateCache(`metrics:*:${project.id}`);
    return c.json<ApiResponse<MetricResult>>({ success: true, data: result, error: null }, 201);
  } catch (err) {
    logger.error({ err }, 'Compute metrics error');
    return c.json<ApiResponse>({ success: false, data: null, error: 'Internal server error' }, 500);
  }
});

overview.get('/projects/:id/recent-prs', requireProject(), async (c) => {
  try {
    const project = c.get('project');

    const limit = parseInt(c.req.query('limit') ?? '5');
    const prs = await prisma.pullRequest.findMany({
      where: { projectId: project.id },
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

overview.get('/projects/:id/digest', requireProject(), async (c) => {
  try {
    const project = c.get('project');
    const digest = await digestService.generateWeeklyDigest(project.id);
    return c.json({ success: true, data: digest, error: null });
  } catch (err) {
    logger.error({ err }, 'Digest error');
    return c.json<ApiResponse>({ success: false, data: null, error: 'Internal server error' }, 500);
  }
});

export default overview;
