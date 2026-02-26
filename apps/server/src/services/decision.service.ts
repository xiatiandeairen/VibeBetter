import { prisma } from '@vibebetter/db';
import type { Decision } from '@vibebetter/db';
import { HOTSPOT_THRESHOLDS } from '@vibebetter/shared';
import { AppError } from '../middleware/error-handler.js';
import { metricsService } from './metrics.service.js';

interface DecisionCandidate {
  level: string;
  category: string;
  title: string;
  description: string;
  priority: number;
}

export class DecisionService {
  async generateDecisions(projectId: string): Promise<Decision[]> {
    const candidates: DecisionCandidate[] = [];

    const aiSuccessRate = await metricsService.computeAiSuccessRate(projectId);
    const psri = await metricsService.computePsri(projectId);
    const tdi = await metricsService.computeTdi(projectId);

    const files = await prisma.fileMetric.findMany({
      where: { projectId },
      select: { cyclomaticComplexity: true, changeFrequency90d: true },
    });

    const hotspotFiles = files.filter(
      (f) =>
        f.changeFrequency90d >= HOTSPOT_THRESHOLDS.minChangeFrequency &&
        f.cyclomaticComplexity >= HOTSPOT_THRESHOLDS.minComplexity,
    ).length;

    const totalPrs = await prisma.pullRequest.count({ where: { projectId } });
    const aiPrCount = await prisma.pullRequest.count({ where: { projectId, aiUsed: true } });
    const aiPrRatio = totalPrs > 0 ? aiPrCount / totalPrs : 0;

    if (aiSuccessRate !== null && aiSuccessRate > 0.8 && psri.score !== null && psri.score < 0.3) {
      candidates.push({
        level: 'INFO',
        category: 'AI_USAGE',
        title: 'Expand AI usage',
        description:
          'AI coding is performing well. Consider expanding AI usage to more modules.',
        priority: 2,
      });
    }

    if (aiSuccessRate !== null && aiSuccessRate > 0.9) {
      candidates.push({
        level: 'INFO',
        category: 'AI_USAGE',
        title: 'Excellent AI adoption',
        description:
          'Excellent AI adoption — team achieving >90% success rate.',
        priority: 1,
      });
    }

    if (aiSuccessRate !== null && aiSuccessRate < 0.5) {
      candidates.push({
        level: 'WARNING',
        category: 'AI_USAGE',
        title: 'Review AI tool configuration',
        description:
          'AI success rate is below 50%. Review AI tool configuration and consider additional training or prompt improvements.',
        priority: 4,
      });
    }

    if (psri.score !== null && psri.score > 0.6) {
      candidates.push({
        level: 'WARNING',
        category: 'RISK',
        title: 'Limit AI auto-generation on high-risk modules',
        description:
          'PSRI score exceeds 0.6. Recommend limiting AI auto-generation on high-risk modules to reduce structural risk.',
        priority: 5,
      });
    }

    if (hotspotFiles >= 3 && hotspotFiles <= 10) {
      candidates.push({
        level: 'WARNING',
        category: 'CODE_QUALITY',
        title: 'Hotspot files need attention',
        description:
          '3-10 hotspot files detected. Prioritize code reviews for these files.',
        priority: 3,
      });
    }

    if (hotspotFiles > 10) {
      candidates.push({
        level: 'CRITICAL',
        category: 'CODE_QUALITY',
        title: 'Recommend immediate code review sprint',
        description: `Over 10 hotspot files. Recommend immediate code review sprint.`,
        priority: 5,
      });
    }

    if (aiPrRatio > 0.7) {
      candidates.push({
        level: 'INFO',
        category: 'AI_USAGE',
        title: 'High AI adoption rate',
        description:
          'High AI adoption rate. Monitor for quality trade-offs.',
        priority: 2,
      });
    }

    if (psri.change !== null && psri.change > 0.4) {
      candidates.push({
        level: 'WARNING',
        category: 'RISK',
        title: 'High change churn detected',
        description:
          'High change churn detected. Consider stabilization period.',
        priority: 4,
      });
    }

    if (tdi !== null && tdi > 0.7) {
      candidates.push({
        level: 'CRITICAL',
        category: 'TECH_DEBT',
        title: 'Recommend tech debt reduction sprint',
        description: `Technical Debt Index is ${tdi.toFixed(2)}, which exceeds the 0.7 threshold. Recommend a dedicated tech debt reduction sprint.`,
        priority: 5,
      });
    }

    const created: Decision[] = [];
    for (const candidate of candidates) {
      const decision = await prisma.decision.create({
        data: {
          projectId,
          ...candidate,
        },
      });
      created.push(decision);
    }

    return created;
  }

  async listDecisions(projectId: string): Promise<Decision[]> {
    return prisma.decision.findMany({
      where: { projectId },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async updateDecisionStatus(decisionId: string, status: string): Promise<Decision> {
    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      throw AppError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const decision = await prisma.decision.findUnique({ where: { id: decisionId } });
    if (!decision) {
      throw AppError.notFound('Decision not found');
    }

    return prisma.decision.update({
      where: { id: decisionId },
      data: { status },
    });
  }
}

export const decisionService = new DecisionService();
