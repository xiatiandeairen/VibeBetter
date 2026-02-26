import { prisma } from '@vibebetter/db';

export class DigestService {
  async generateWeeklyDigest(projectId: string) {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const snapshots = await prisma.metricSnapshot.findMany({
      where: { projectId, snapshotDate: { gte: weekAgo } },
      orderBy: { snapshotDate: 'desc' },
    });

    const latest = snapshots[0];
    const oldest = snapshots[snapshots.length - 1];

    const prsThisWeek = await prisma.pullRequest.count({
      where: { projectId, createdAt: { gte: weekAgo } },
    });

    const aiPrsThisWeek = await prisma.pullRequest.count({
      where: { projectId, aiUsed: true, createdAt: { gte: weekAgo } },
    });

    return {
      period: { from: weekAgo.toISOString(), to: now.toISOString() },
      metrics: {
        aiSuccessRate: latest?.aiSuccessRate ?? null,
        aiStableRate: latest?.aiStableRate ?? null,
        psriScore: latest?.psriScore ?? null,
        tdiScore: latest?.tdiScore ?? null,
      },
      trends: {
        psriChange: latest && oldest ? (latest.psriScore ?? 0) - (oldest.psriScore ?? 0) : 0,
        tdiChange: latest && oldest ? (latest.tdiScore ?? 0) - (oldest.tdiScore ?? 0) : 0,
      },
      activity: { prsThisWeek, aiPrsThisWeek },
      snapshotCount: snapshots.length,
    };
  }
}

export const digestService = new DigestService();
