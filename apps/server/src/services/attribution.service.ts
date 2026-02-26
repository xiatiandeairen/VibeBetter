import { prisma } from '@vibebetter/db';

export class AttributionService {
  async getAiAttribution(projectId: string) {
    const files = await prisma.fileMetric.findMany({ where: { projectId } });
    const prs = await prisma.pullRequest.findMany({ where: { projectId } });

    const aiPrs = prs.filter((p) => p.aiUsed);
    const humanPrs = prs.filter((p) => !p.aiUsed);

    const aiHeavyFiles = files.filter((f) => (f.aiCodeRatio ?? 0) > 0.5);
    const humanHeavyFiles = files.filter((f) => (f.aiCodeRatio ?? 0) <= 0.5);

    const aiFilesAvgComplexity =
      aiHeavyFiles.length > 0
        ? aiHeavyFiles.reduce((s, f) => s + f.cyclomaticComplexity, 0) /
          aiHeavyFiles.length
        : 0;
    const humanFilesAvgComplexity =
      humanHeavyFiles.length > 0
        ? humanHeavyFiles.reduce((s, f) => s + f.cyclomaticComplexity, 0) /
          humanHeavyFiles.length
        : 0;

    const aiFilesAvgChanges =
      aiHeavyFiles.length > 0
        ? aiHeavyFiles.reduce((s, f) => s + f.changeFrequency90d, 0) /
          aiHeavyFiles.length
        : 0;
    const humanFilesAvgChanges =
      humanHeavyFiles.length > 0
        ? humanHeavyFiles.reduce((s, f) => s + f.changeFrequency90d, 0) /
          humanHeavyFiles.length
        : 0;

    const aiMajorRevisionRate =
      aiPrs.length > 0
        ? aiPrs.filter((p) => p.majorRevision).length / aiPrs.length
        : 0;
    const humanMajorRevisionRate =
      humanPrs.length > 0
        ? humanPrs.filter((p) => p.majorRevision).length / humanPrs.length
        : 0;
    const aiRollbackRate =
      aiPrs.length > 0
        ? aiPrs.filter((p) => p.rollbackFlag).length / aiPrs.length
        : 0;
    const humanRollbackRate =
      humanPrs.length > 0
        ? humanPrs.filter((p) => p.rollbackFlag).length / humanPrs.length
        : 0;

    return {
      summary: {
        aiFileCount: aiHeavyFiles.length,
        humanFileCount: humanHeavyFiles.length,
        aiPrCount: aiPrs.length,
        humanPrCount: humanPrs.length,
      },
      complexity: {
        aiAvg: Math.round(aiFilesAvgComplexity * 10) / 10,
        humanAvg: Math.round(humanFilesAvgComplexity * 10) / 10,
        verdict:
          aiFilesAvgComplexity <= humanFilesAvgComplexity
            ? 'AI code is less complex'
            : 'AI code is more complex',
      },
      stability: {
        aiChangeFreq: Math.round(aiFilesAvgChanges * 10) / 10,
        humanChangeFreq: Math.round(humanFilesAvgChanges * 10) / 10,
        verdict:
          aiFilesAvgChanges <= humanFilesAvgChanges
            ? 'AI code is more stable'
            : 'AI code changes more frequently',
      },
      quality: {
        aiMajorRevisionRate: Math.round(aiMajorRevisionRate * 1000) / 1000,
        humanMajorRevisionRate:
          Math.round(humanMajorRevisionRate * 1000) / 1000,
        aiRollbackRate: Math.round(aiRollbackRate * 1000) / 1000,
        humanRollbackRate: Math.round(humanRollbackRate * 1000) / 1000,
      },
    };
  }

  async getFailedPrAttribution(projectId: string) {
    const prs = await prisma.pullRequest.findMany({ where: { projectId } });

    const majorRevisions = prs.filter((p) => p.majorRevision);
    const rollbacks = prs.filter((p) => p.rollbackFlag);
    const highReviewRounds = prs.filter((p) => p.reviewRounds > 3);

    return {
      totalFailed: majorRevisions.length + rollbacks.length,
      majorRevisions: {
        count: majorRevisions.length,
        aiCount: majorRevisions.filter((p) => p.aiUsed).length,
      },
      rollbacks: {
        count: rollbacks.length,
        aiCount: rollbacks.filter((p) => p.aiUsed).length,
      },
      highReviewRounds: {
        count: highReviewRounds.length,
        aiCount: highReviewRounds.filter((p) => p.aiUsed).length,
      },
    };
  }
}

export const attributionService = new AttributionService();
