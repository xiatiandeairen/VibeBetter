import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@vibebetter/db', () => ({
  prisma: {
    fileMetric: {
      findMany: vi.fn(),
    },
    pullRequest: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from '@vibebetter/db';
import { AttributionService } from './attribution.service.js';

const fileFindMany = prisma.fileMetric.findMany as ReturnType<typeof vi.fn>;
const prFindMany = prisma.pullRequest.findMany as ReturnType<typeof vi.fn>;

describe('AttributionService', () => {
  let service: AttributionService;

  beforeEach(() => {
    service = new AttributionService();
    vi.clearAllMocks();
  });

  describe('getAiAttribution', () => {
    it('returns correct summary for mixed AI/human data', async () => {
      fileFindMany.mockResolvedValue([
        { aiCodeRatio: 0.8, cyclomaticComplexity: 10, changeFrequency90d: 5 },
        { aiCodeRatio: 0.3, cyclomaticComplexity: 20, changeFrequency90d: 15 },
        { aiCodeRatio: 0.6, cyclomaticComplexity: 8, changeFrequency90d: 3 },
      ]);
      prFindMany.mockResolvedValue([
        { aiUsed: true, majorRevision: false, rollbackFlag: false },
        { aiUsed: false, majorRevision: true, rollbackFlag: false },
        { aiUsed: true, majorRevision: true, rollbackFlag: true },
      ]);

      const result = await service.getAiAttribution('proj-1');

      expect(result.summary.aiFileCount).toBe(2);
      expect(result.summary.humanFileCount).toBe(1);
      expect(result.summary.aiPrCount).toBe(2);
      expect(result.summary.humanPrCount).toBe(1);
    });

    it('returns correct complexity comparison', async () => {
      fileFindMany.mockResolvedValue([
        { aiCodeRatio: 0.8, cyclomaticComplexity: 10, changeFrequency90d: 5 },
        { aiCodeRatio: 0.2, cyclomaticComplexity: 30, changeFrequency90d: 15 },
      ]);
      prFindMany.mockResolvedValue([]);

      const result = await service.getAiAttribution('proj-1');

      expect(result.complexity.aiAvg).toBe(10);
      expect(result.complexity.humanAvg).toBe(30);
      expect(result.complexity.verdict).toBe('AI code is less complex');
    });

    it('handles empty data gracefully', async () => {
      fileFindMany.mockResolvedValue([]);
      prFindMany.mockResolvedValue([]);

      const result = await service.getAiAttribution('proj-1');

      expect(result.summary.aiFileCount).toBe(0);
      expect(result.summary.humanFileCount).toBe(0);
      expect(result.complexity.aiAvg).toBe(0);
      expect(result.complexity.humanAvg).toBe(0);
    });

    it('computes quality metrics (revision/rollback rates)', async () => {
      fileFindMany.mockResolvedValue([]);
      prFindMany.mockResolvedValue([
        { aiUsed: true, majorRevision: true, rollbackFlag: false },
        { aiUsed: true, majorRevision: false, rollbackFlag: true },
        { aiUsed: true, majorRevision: false, rollbackFlag: false },
        { aiUsed: false, majorRevision: false, rollbackFlag: false },
      ]);

      const result = await service.getAiAttribution('proj-1');

      expect(result.quality.aiMajorRevisionRate).toBeCloseTo(0.333, 2);
      expect(result.quality.aiRollbackRate).toBeCloseTo(0.333, 2);
      expect(result.quality.humanMajorRevisionRate).toBe(0);
      expect(result.quality.humanRollbackRate).toBe(0);
    });
  });

  describe('getFailedPrAttribution', () => {
    it('counts failed PRs by category', async () => {
      prFindMany.mockResolvedValue([
        { aiUsed: true, majorRevision: true, rollbackFlag: false, reviewRounds: 1 },
        { aiUsed: false, majorRevision: false, rollbackFlag: true, reviewRounds: 5 },
        { aiUsed: true, majorRevision: false, rollbackFlag: false, reviewRounds: 4 },
        { aiUsed: false, majorRevision: false, rollbackFlag: false, reviewRounds: 2 },
      ]);

      const result = await service.getFailedPrAttribution('proj-1');

      expect(result.totalFailed).toBe(2);
      expect(result.majorRevisions.count).toBe(1);
      expect(result.majorRevisions.aiCount).toBe(1);
      expect(result.rollbacks.count).toBe(1);
      expect(result.rollbacks.aiCount).toBe(0);
      expect(result.highReviewRounds.count).toBe(2);
      expect(result.highReviewRounds.aiCount).toBe(1);
    });

    it('handles empty PRs', async () => {
      prFindMany.mockResolvedValue([]);

      const result = await service.getFailedPrAttribution('proj-1');

      expect(result.totalFailed).toBe(0);
      expect(result.majorRevisions.count).toBe(0);
      expect(result.rollbacks.count).toBe(0);
      expect(result.highReviewRounds.count).toBe(0);
    });
  });
});
