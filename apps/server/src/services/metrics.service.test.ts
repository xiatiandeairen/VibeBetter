import { describe, it, expect, vi, beforeEach } from 'vitest';
import { safeDiv, PSRI_DEFAULT_WEIGHTS } from '@vibebetter/shared';

vi.mock('@vibebetter/db', () => ({
  prisma: {
    pullRequest: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    fileMetric: {
      findMany: vi.fn(),
    },
    metricSnapshot: {
      create: vi.fn(),
    },
  },
}));

import { prisma } from '@vibebetter/db';
import { MetricsService } from './metrics.service.js';

const prFindMany = prisma.pullRequest.findMany as ReturnType<typeof vi.fn>;
const fileFindMany = prisma.fileMetric.findMany as ReturnType<typeof vi.fn>;
const prFindManyForPsri = prisma.pullRequest.findMany as ReturnType<typeof vi.fn>;

describe('safeDiv utility', () => {
  it('returns null when denominator is 0', () => {
    expect(safeDiv(10, 0)).toBeNull();
  });

  it('returns correct division result', () => {
    expect(safeDiv(10, 2)).toBe(5);
  });

  it('handles fractional results', () => {
    expect(safeDiv(1, 3)).toBeCloseTo(0.333, 2);
  });

  it('returns 0 when numerator is 0', () => {
    expect(safeDiv(0, 5)).toBe(0);
  });
});

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(() => {
    service = new MetricsService();
    vi.clearAllMocks();
  });

  describe('computeAiSuccessRate', () => {
    it('returns null when there are no AI PRs', async () => {
      prFindMany.mockResolvedValue([]);
      const result = await service.computeAiSuccessRate('proj-1');
      expect(result).toBeNull();
    });

    it('computes correct rate when all AI PRs are successful', async () => {
      prFindMany.mockResolvedValue([
        { majorRevision: false },
        { majorRevision: false },
        { majorRevision: false },
      ]);
      const result = await service.computeAiSuccessRate('proj-1');
      expect(result).toBe(1);
    });

    it('computes correct rate with mixed results', async () => {
      prFindMany.mockResolvedValue([
        { majorRevision: false },
        { majorRevision: true },
        { majorRevision: false },
        { majorRevision: true },
      ]);
      const result = await service.computeAiSuccessRate('proj-1');
      expect(result).toBe(0.5);
    });
  });

  describe('computeAiStableRate', () => {
    it('returns null when there are no AI PRs', async () => {
      prFindMany.mockResolvedValue([]);
      const result = await service.computeAiStableRate('proj-1');
      expect(result).toBeNull();
    });

    it('computes correct stable rate', async () => {
      prFindMany.mockResolvedValue([
        { rollbackFlag: false },
        { rollbackFlag: false },
        { rollbackFlag: true },
      ]);
      const result = await service.computeAiStableRate('proj-1');
      expect(result).toBeCloseTo(0.667, 2);
    });
  });

  describe('computePsri', () => {
    it('returns all nulls when no data exists', async () => {
      fileFindMany.mockResolvedValue([]);
      prFindManyForPsri.mockResolvedValue([]);

      const result = await service.computePsri('proj-1');
      expect(result).toEqual({ score: null, structural: null, change: null, defect: null });
    });

    it('computes PSRI with known values', async () => {
      fileFindMany.mockResolvedValueOnce([
        { cyclomaticComplexity: 50, changeFrequency90d: 25 },
        { cyclomaticComplexity: 30, changeFrequency90d: 15 },
      ]);

      prFindManyForPsri.mockResolvedValueOnce([
        { rollbackFlag: false },
        { rollbackFlag: false },
        { rollbackFlag: true },
        { rollbackFlag: false },
      ]);

      const result = await service.computePsri('proj-1');

      const avgComplexity = (50 + 30) / 2;
      const avgChangeFreq = (25 + 15) / 2;
      const rollbackRate = 1 / 4;

      const structural = avgComplexity / 100;
      const change = avgChangeFreq / 50;
      const defect = rollbackRate;

      const expectedScore =
        PSRI_DEFAULT_WEIGHTS.structural * structural +
        PSRI_DEFAULT_WEIGHTS.change * change +
        PSRI_DEFAULT_WEIGHTS.defect * defect;

      expect(result.structural).toBeCloseTo(structural, 5);
      expect(result.change).toBeCloseTo(change, 5);
      expect(result.defect).toBeCloseTo(defect, 5);
      expect(result.score).toBeCloseTo(expectedScore, 5);
    });

    it('caps structural and change at 1.0', async () => {
      fileFindMany.mockResolvedValueOnce([{ cyclomaticComplexity: 200, changeFrequency90d: 100 }]);

      prFindManyForPsri.mockResolvedValueOnce([]);

      const result = await service.computePsri('proj-1');
      expect(result.structural).toBe(1);
      expect(result.change).toBe(1);
    });
  });
});
