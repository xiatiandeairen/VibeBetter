import { Hono } from 'hono';
import { MetricsQuerySchema } from '@vibebetter/shared';
import type { ApiResponse } from '@vibebetter/shared';
import { prisma } from '@vibebetter/db';
import { requireProject } from '../../../middleware/require-project.js';
import { logger } from '../../../utils/logger.js';

const exportRoutes = new Hono();

exportRoutes.get('/projects/:id/export', requireProject(), async (c) => {
  try {
    const project = c.get('project');

    const format = c.req.query('format') || 'json';
    const snapshots = await prisma.metricSnapshot.findMany({
      where: { projectId: project.id },
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

exportRoutes.get('/projects/:id/snapshots', requireProject(), async (c) => {
  try {
    const project = c.get('project');

    const query = MetricsQuerySchema.safeParse(c.req.query());
    if (!query.success) {
      return c.json<ApiResponse>(
        { success: false, data: null, error: query.error.errors.map((e) => e.message).join(', ') },
        400,
      );
    }

    const { from, to, limit } = query.data;

    const where: Record<string, unknown> = { projectId: project.id };
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

export default exportRoutes;
