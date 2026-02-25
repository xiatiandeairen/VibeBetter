import { prisma } from '@vibebetter/db';
import { safeDiv, PSRI_DEFAULT_WEIGHTS, HOTSPOT_THRESHOLDS } from '@vibebetter/shared';
import type { MetricResult } from '@vibebetter/shared';

export class MetricsService {
  async computeAiSuccessRate(projectId: string): Promise<number | null> {
    const aiPrs = await prisma.pullRequest.findMany({
      where: { projectId, aiUsed: true },
      select: { majorRevision: true },
    });
    if (aiPrs.length === 0) return null;
    const successful = aiPrs.filter((pr) => !pr.majorRevision).length;
    return safeDiv(successful, aiPrs.length);
  }

  async computeAiStableRate(projectId: string): Promise<number | null> {
    const aiPrs = await prisma.pullRequest.findMany({
      where: { projectId, aiUsed: true },
      select: { rollbackFlag: true },
    });
    if (aiPrs.length === 0) return null;
    const stable = aiPrs.filter((pr) => !pr.rollbackFlag).length;
    return safeDiv(stable, aiPrs.length);
  }

  async computePsri(
    projectId: string,
  ): Promise<{
    score: number | null;
    structural: number | null;
    change: number | null;
    defect: number | null;
  }> {
    const files = await prisma.fileMetric.findMany({
      where: { projectId },
      select: { cyclomaticComplexity: true, changeFrequency90d: true },
    });

    const prs = await prisma.pullRequest.findMany({
      where: { projectId },
      select: { rollbackFlag: true },
    });

    if (files.length === 0 && prs.length === 0) {
      return { score: null, structural: null, change: null, defect: null };
    }

    const avgComplexity =
      files.length > 0
        ? files.reduce((sum, f) => sum + f.cyclomaticComplexity, 0) / files.length
        : 0;

    const avgChangeFreq =
      files.length > 0 ? files.reduce((sum, f) => sum + f.changeFrequency90d, 0) / files.length : 0;

    const rollbackRate =
      prs.length > 0 ? prs.filter((pr) => pr.rollbackFlag).length / prs.length : 0;

    const maxComplexity = 100;
    const maxChangeFreq = 50;

    const structural = Math.min(avgComplexity / maxComplexity, 1);
    const change = Math.min(avgChangeFreq / maxChangeFreq, 1);
    const defect = rollbackRate;

    const score =
      PSRI_DEFAULT_WEIGHTS.structural * structural +
      PSRI_DEFAULT_WEIGHTS.change * change +
      PSRI_DEFAULT_WEIGHTS.defect * defect;

    return { score, structural, change, defect };
  }

  async computeAndSaveSnapshot(projectId: string): Promise<MetricResult> {
    const aiSuccessRate = await this.computeAiSuccessRate(projectId);
    const aiStableRate = await this.computeAiStableRate(projectId);
    const psri = await this.computePsri(projectId);

    const totalPrs = await prisma.pullRequest.count({ where: { projectId } });
    const aiPrs = await prisma.pullRequest.count({ where: { projectId, aiUsed: true } });

    const files = await prisma.fileMetric.findMany({
      where: { projectId },
      select: { cyclomaticComplexity: true, changeFrequency90d: true },
    });

    const totalFiles = files.length;
    const avgComplexity =
      totalFiles > 0
        ? files.reduce((sum, f) => sum + f.cyclomaticComplexity, 0) / totalFiles
        : null;

    const hotspotFiles = files.filter(
      (f) =>
        f.changeFrequency90d >= HOTSPOT_THRESHOLDS.minChangeFrequency &&
        f.cyclomaticComplexity >= HOTSPOT_THRESHOLDS.minComplexity,
    ).length;

    await prisma.metricSnapshot.create({
      data: {
        projectId,
        snapshotDate: new Date(),
        aiSuccessRate,
        aiStableRate,
        totalPrs,
        aiPrs,
        psriScore: psri.score,
        psriStructural: psri.structural,
        psriChange: psri.change,
        psriDefect: psri.defect,
        avgComplexity,
        totalFiles,
        hotspotFiles,
      },
    });

    return {
      aiSuccessRate,
      aiStableRate,
      totalPrs,
      aiPrs,
      psriScore: psri.score,
      psriStructural: psri.structural,
      psriChange: psri.change,
      psriDefect: psri.defect,
      avgComplexity,
      totalFiles,
      hotspotFiles,
    };
  }

  async getTopFiles(projectId: string, limit = 10) {
    const files = await prisma.fileMetric.findMany({
      where: { projectId },
      orderBy: [{ cyclomaticComplexity: 'desc' }, { changeFrequency90d: 'desc' }],
    });

    return files
      .map((f) => ({
        ...f,
        riskScore: f.cyclomaticComplexity * f.changeFrequency90d,
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, limit);
  }
}

export const metricsService = new MetricsService();
