import { Hono } from 'hono';
import type { ApiResponse } from '@vibebetter/shared';
import { prisma } from '@vibebetter/db';
import { requireProject } from '../../../middleware/require-project.js';
import { metricsService } from '../../../services/metrics.service.js';
import { attributionService } from '../../../services/attribution.service.js';
import { logger } from '../../../utils/logger.js';

const files = new Hono();

files.get('/projects/:id/files/top', requireProject(), async (c) => {
  try {
    const project = c.get('project');

    const limitParam = c.req.query('limit');
    const limit = limitParam ? parseInt(limitParam) : 10;
    const sort = c.req.query('sort') || 'default';

    const topFiles = await metricsService.getTopFiles(project.id, limit, sort);
    return c.json<ApiResponse<typeof topFiles>>({ success: true, data: topFiles, error: null });
  } catch (err) {
    logger.error({ err }, 'Top files error');
    return c.json<ApiResponse>({ success: false, data: null, error: 'Internal server error' }, 500);
  }
});

files.get('/projects/:id/prs', requireProject(), async (c) => {
  try {
    const project = c.get('project');

    const prs = await prisma.pullRequest.findMany({
      where: { projectId: project.id },
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

files.get('/projects/:id/developers', requireProject(), async (c) => {
  try {
    const project = c.get('project');

    const prs = await prisma.pullRequest.findMany({ where: { projectId: project.id } });
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

files.get('/projects/:id/attribution', requireProject(), async (c) => {
  try {
    const project = c.get('project');

    const data = await attributionService.getAiAttribution(project.id);
    return c.json({ success: true, data, error: null });
  } catch (err) {
    logger.error({ err }, 'Attribution error');
    return c.json<ApiResponse>(
      { success: false, data: null, error: 'Internal server error' },
      500,
    );
  }
});

files.get('/projects/:id/failed-prs', requireProject(), async (c) => {
  try {
    const project = c.get('project');

    const data = await attributionService.getFailedPrAttribution(project.id);
    return c.json({ success: true, data, error: null });
  } catch (err) {
    logger.error({ err }, 'Failed PRs error');
    return c.json<ApiResponse>(
      { success: false, data: null, error: 'Internal server error' },
      500,
    );
  }
});

export default files;
