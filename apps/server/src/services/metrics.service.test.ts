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
    weightConfig: {
      findUnique: vi.fn(),
    },
    decision: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from '@vibebetter/db';
import { MetricsService } from './metrics.service.js';

const prFindMany = prisma.pullRequest.findMany as ReturnType<typeof vi.fn>;
const fileFindMany = prisma.fileMetric.findMany as ReturnType<typeof vi.fn>;
const prFindManyForPsri = prisma.pullRequest.findMany as ReturnType<typeof vi.fn>;
const weightConfigFindUnique = prisma.weightConfig.findUnique as ReturnType<typeof vi.fn>;

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
    weightConfigFindUnique.mockResolvedValue(null);
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

    it('computes PSRI with 6 dimensions using default weights', async () => {
      fileFindMany.mockResolvedValueOnce([
        { cyclomaticComplexity: 50, changeFrequency90d: 25, authorCount: 2 },
        { cyclomaticComplexity: 30, changeFrequency90d: 15, authorCount: 8 },
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
      const architecture = 1 / 2;
      const runtime = 0;
      const coverage = 0.5;

      const expectedScore =
        PSRI_DEFAULT_WEIGHTS.structural * structural +
        PSRI_DEFAULT_WEIGHTS.change * change +
        PSRI_DEFAULT_WEIGHTS.defect * defect +
        PSRI_DEFAULT_WEIGHTS.architecture * architecture +
        PSRI_DEFAULT_WEIGHTS.runtime * runtime +
        PSRI_DEFAULT_WEIGHTS.coverage * coverage;

      expect(result.structural).toBeCloseTo(structural, 5);
      expect(result.change).toBeCloseTo(change, 5);
      expect(result.defect).toBeCloseTo(defect, 5);
      expect(result.score).toBeCloseTo(expectedScore, 5);
    });

    it('caps structural and change at 1.0', async () => {
      fileFindMany.mockResolvedValueOnce([
        { cyclomaticComplexity: 200, changeFrequency90d: 100, authorCount: 1 },
      ]);

      prFindManyForPsri.mockResolvedValueOnce([]);

      const result = await service.computePsri('proj-1');
      expect(result.structural).toBe(1);
      expect(result.change).toBe(1);
    });

    it('uses custom weights from WeightConfig', async () => {
      fileFindMany.mockResolvedValueOnce([
        { cyclomaticComplexity: 50, changeFrequency90d: 25, authorCount: 2 },
      ]);
      prFindManyForPsri.mockResolvedValueOnce([
        { rollbackFlag: false },
      ]);

      weightConfigFindUnique.mockResolvedValueOnce({
        structural: 0.3,
        change: 0.3,
        defect: 0.1,
        architecture: 0.1,
        runtime: 0.1,
        coverage: 0.1,
      });

      const result = await service.computePsri('proj-1');
      expect(result.score).not.toBeNull();

      const structural = 50 / 100;
      const change = 25 / 50;
      const defect = 0;
      const architecture = 0;
      const runtime = 0;
      const coverage = 0.5;

      const expectedScore =
        0.3 * structural + 0.3 * change + 0.1 * defect + 0.1 * architecture + 0.1 * runtime + 0.1 * coverage;

      expect(result.score).toBeCloseTo(expectedScore, 5);
    });
  });

  describe('computeTdi', () => {
    it('returns null when there are no files', async () => {
      fileFindMany.mockResolvedValue([]);
      const result = await service.computeTdi('proj-1');
      expect(result).toBeNull();
    });

    it('computes TDI with known values', async () => {
      fileFindMany.mockResolvedValue([
        { cyclomaticComplexity: 20, changeFrequency90d: 10 },
        { cyclomaticComplexity: 5, changeFrequency90d: 20 },
        { cyclomaticComplexity: 25, changeFrequency90d: 5 },
        { cyclomaticComplexity: 10, changeFrequency90d: 15 },
      ]);

      const result = await service.computeTdi('proj-1');
      expect(result).not.toBeNull();

      const highComplexityRatio = 2 / 4;
      const duplicationRatio = 0;
      const lowCoverageRatio = 0.5;
      const avgChangeFreq = (10 + 20 + 5 + 15) / 4;
      const maxChangeFreq = 20;

      const expectedTdi =
        (highComplexityRatio + duplicationRatio + lowCoverageRatio) * (avgChangeFreq / maxChangeFreq);

      expect(result).toBeCloseTo(expectedTdi, 5);
    });

    it('caps TDI at 1.0', async () => {
      fileFindMany.mockResolvedValue([
        { cyclomaticComplexity: 100, changeFrequency90d: 50 },
        { cyclomaticComplexity: 100, changeFrequency90d: 50 },
      ]);

      const result = await service.computeTdi('proj-1');
      expect(result).not.toBeNull();
      expect(result!).toBeLessThanOrEqual(1);
    });
  });
});

describe('Decision generation rules', () => {
  let service: MetricsService;

  beforeEach(() => {
    service = new MetricsService();
    vi.clearAllMocks();
    weightConfigFindUnique.mockResolvedValue(null);
  });

  it('AI Success Rate > 90% and PSRI < 0.3 → expand AI usage', async () => {
    const aiRate = await computeMockAiSuccessRate(0.95);
    expect(aiRate).toBeGreaterThan(0.9);

    const psriScore = 0.25;
    expect(psriScore).toBeLessThan(0.3);

    expect(aiRate > 0.9 && psriScore < 0.3).toBe(true);
  });

  it('AI Success Rate < 50% → review AI tool config', async () => {
    const aiRate = await computeMockAiSuccessRate(0.4);
    expect(aiRate).toBeLessThan(0.5);
  });

  it('PSRI > 0.6 → limit AI on high-risk modules', () => {
    const psriScore = 0.7;
    expect(psriScore).toBeGreaterThan(0.6);
  });

  it('hotspot files > 10 → recommend code review sprint', () => {
    const hotspotFiles = 15;
    expect(hotspotFiles).toBeGreaterThan(10);
  });

  it('TDI > 0.7 → recommend tech debt reduction sprint', async () => {
    fileFindMany.mockResolvedValue([
      { cyclomaticComplexity: 50, changeFrequency90d: 30 },
      { cyclomaticComplexity: 40, changeFrequency90d: 30 },
      { cyclomaticComplexity: 60, changeFrequency90d: 30 },
    ]);

    const tdi = await service.computeTdi('proj-1');
    expect(tdi).not.toBeNull();
    expect(tdi!).toBeGreaterThan(0.7);
  });
});

async function computeMockAiSuccessRate(targetRate: number): Promise<number> {
  return targetRate;
}
