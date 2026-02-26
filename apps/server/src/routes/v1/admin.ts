import { Hono } from 'hono';
import type { ApiResponse } from '@vibebetter/shared';
import { prisma } from '@vibebetter/db';
import { authMiddleware } from '../../middleware/auth.js';
import { logger } from '../../utils/logger.js';

const admin = new Hono();

admin.use('*', authMiddleware);

admin.get('/stats', async (c) => {
  try {
    const user = c.get('user');
    if (user.role !== 'admin') {
      return c.json<ApiResponse>({ success: false, data: null, error: 'Admin access required' }, 403);
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      totalProjects,
      activeProjects,
      totalPrs,
      aiPrs,
      completedCollections,
      failedCollections,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { updatedAt: { gte: sevenDaysAgo } } }),
      prisma.project.count(),
      prisma.project.count({ where: { isActive: true } }),
      prisma.pullRequest.count(),
      prisma.pullRequest.count({ where: { aiUsed: true } }),
      prisma.collectionJob.count({ where: { status: 'COMPLETED' } }),
      prisma.collectionJob.count({ where: { status: 'FAILED' } }),
    ]);

    return c.json<ApiResponse>({
      success: true,
      data: {
        users: { total: totalUsers, active7d: activeUsers },
        projects: { total: totalProjects, active: activeProjects },
        prs: { total: totalPrs, aiPrs },
        collections: { completed: completedCollections, failed: failedCollections },
      },
      error: null,
    });
  } catch (err) {
    logger.error({ err }, 'Admin stats error');
    return c.json<ApiResponse>({ success: false, data: null, error: 'Internal server error' }, 500);
  }
});

admin.get('/projects/stats', async (c) => {
  try {
    const user = c.get('user');
    if (user.role !== 'admin') {
      return c.json<ApiResponse>({ success: false, data: null, error: 'Admin access required' }, 403);
    }

    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { pullRequests: true } },
      },
      orderBy: { name: 'asc' },
    });

    const stats = projects.map((p) => ({
      projectId: p.id,
      name: p.name,
      prCount: p._count.pullRequests,
    }));

    return c.json<ApiResponse>({
      success: true,
      data: { projects: stats, total: stats.length },
      error: null,
    });
  } catch (err) {
    logger.error({ err }, 'Admin project stats error');
    return c.json<ApiResponse>({ success: false, data: null, error: 'Internal server error' }, 500);
  }
});

export default admin;
