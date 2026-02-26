import { describe, it, expect, vi, beforeEach } from 'vitest';

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
import { DecisionService } from './decision.service.js';
import { MetricsService } from './metrics.service.js';

const prFindMany = prisma.pullRequest.findMany as ReturnType<typeof vi.fn>;
const prCount = prisma.pullRequest.count as ReturnType<typeof vi.fn>;
const fileFindMany = prisma.fileMetric.findMany as ReturnType<typeof vi.fn>;
const weightConfigFindUnique = prisma.weightConfig.findUnique as ReturnType<typeof vi.fn>;
const decisionCreate = prisma.decision.create as ReturnType<typeof vi.fn>;
const decisionFindMany = prisma.decision.findMany as ReturnType<typeof vi.fn>;
const decisionFindUnique = prisma.decision.findUnique as ReturnType<typeof vi.fn>;
const decisionUpdate = prisma.decision.update as ReturnType<typeof vi.fn>;

describe('DecisionService', () => {
  let service: DecisionService;
  let createCallIndex: number;

  beforeEach(() => {
    service = new DecisionService();
    vi.clearAllMocks();
    weightConfigFindUnique.mockResolvedValue(null);
    createCallIndex = 0;
    decisionCreate.mockImplementation(({ data }: { data: Record<string, unknown> }) => {
      createCallIndex++;
      return Promise.resolve({
        id: `dec-${createCallIndex}`,
        ...data,
        status: 'PENDING',
        metadata: null,
        createdAt: new Date('2026-01-01'),
      });
    });
  });

  describe('generateDecisions', () => {
    it('generates "Expand AI usage" when success rate > 80% and PSRI < 0.3', async () => {
      prFindMany.mockResolvedValue([
        { majorRevision: false, rollbackFlag: false, authorLogin: 'dev1', aiUsed: true, mergedAt: new Date() },
        { majorRevision: false, rollbackFlag: false, authorLogin: 'dev1', aiUsed: true, mergedAt: new Date() },
        { majorRevision: false, rollbackFlag: false, authorLogin: 'dev1', aiUsed: true, mergedAt: new Date() },
        { majorRevision: false, rollbackFlag: false, authorLogin: 'dev1', aiUsed: true, mergedAt: new Date() },
        { majorRevision: false, rollbackFlag: false, authorLogin: 'dev1', aiUsed: true, mergedAt: new Date() },
      ]);
      prCount.mockResolvedValue(5);
      fileFindMany.mockResolvedValue([
        { cyclomaticComplexity: 5, changeFrequency90d: 2, authorCount: 1 },
      ]);

      const decisions = await service.generateDecisions('proj-1');
      const titles = decisions.map((d) => d.title);
      expect(titles).toContain('Expand AI usage');
    });

    it('generates "Review AI tool configuration" when success rate < 50%', async () => {
      prFindMany.mockResolvedValue([
        { majorRevision: true, rollbackFlag: false, authorLogin: 'dev1', aiUsed: true, mergedAt: null },
        { majorRevision: true, rollbackFlag: false, authorLogin: 'dev1', aiUsed: true, mergedAt: null },
        { majorRevision: false, rollbackFlag: false, authorLogin: 'dev1', aiUsed: true, mergedAt: new Date() },
      ]);
      prCount.mockResolvedValue(3);
      fileFindMany.mockResolvedValue([
        { cyclomaticComplexity: 5, changeFrequency90d: 2, authorCount: 1 },
      ]);

      const decisions = await service.generateDecisions('proj-1');
      const titles = decisions.map((d) => d.title);
      expect(titles).toContain('Review AI tool configuration');
    });

    it('generates "Limit AI auto-generation" when PSRI > 0.6', async () => {
      prFindMany.mockResolvedValue([
        { majorRevision: false, rollbackFlag: true, authorLogin: 'dev1', aiUsed: true, mergedAt: null },
        { majorRevision: false, rollbackFlag: true, authorLogin: 'dev1', aiUsed: true, mergedAt: null },
      ]);
      prCount.mockResolvedValue(2);
      fileFindMany.mockResolvedValue([
        { cyclomaticComplexity: 80, changeFrequency90d: 40, authorCount: 8 },
        { cyclomaticComplexity: 90, changeFrequency90d: 45, authorCount: 10 },
      ]);

      const decisions = await service.generateDecisions('proj-1');
      const titles = decisions.map((d) => d.title);
      expect(titles).toContain('Limit AI auto-generation on high-risk modules');
    });

    it('generates "Hotspot files need attention" when 3-10 hotspot files', async () => {
      prFindMany.mockResolvedValue([]);
      prCount.mockResolvedValue(0);
      fileFindMany.mockResolvedValue([
        { cyclomaticComplexity: 20, changeFrequency90d: 10, authorCount: 1 },
        { cyclomaticComplexity: 25, changeFrequency90d: 8, authorCount: 1 },
        { cyclomaticComplexity: 18, changeFrequency90d: 12, authorCount: 1 },
        { cyclomaticComplexity: 30, changeFrequency90d: 6, authorCount: 1 },
        { cyclomaticComplexity: 2, changeFrequency90d: 1, authorCount: 1 },
      ]);

      const decisions = await service.generateDecisions('proj-1');
      const titles = decisions.map((d) => d.title);
      expect(titles).toContain('Hotspot files need attention');
    });

    it('generates "Recommend immediate code review sprint" when > 10 hotspot files', async () => {
      prFindMany.mockResolvedValue([]);
      prCount.mockResolvedValue(0);
      const hotspots = Array.from({ length: 12 }, () => ({
        cyclomaticComplexity: 20,
        changeFrequency90d: 10,
        authorCount: 1,
      }));
      fileFindMany.mockResolvedValue(hotspots);

      const decisions = await service.generateDecisions('proj-1');
      const titles = decisions.map((d) => d.title);
      expect(titles).toContain('Recommend immediate code review sprint');
    });

    it('generates "Recommend tech debt reduction sprint" when TDI > 0.7', async () => {
      prFindMany.mockResolvedValue([
        { majorRevision: false, rollbackFlag: false, authorLogin: 'dev1', aiUsed: false, mergedAt: new Date() },
      ]);
      prCount.mockResolvedValue(1);
      fileFindMany.mockResolvedValue([
        { cyclomaticComplexity: 50, changeFrequency90d: 30, authorCount: 1 },
        { cyclomaticComplexity: 40, changeFrequency90d: 30, authorCount: 1 },
        { cyclomaticComplexity: 60, changeFrequency90d: 30, authorCount: 1 },
      ]);

      const decisions = await service.generateDecisions('proj-1');
      const titles = decisions.map((d) => d.title);
      expect(titles).toContain('Recommend tech debt reduction sprint');
    });
  });

  describe('listDecisions', () => {
    it('returns decisions ordered by priority and date', async () => {
      const mockDecisions = [
        { id: '1', level: 'CRITICAL', category: 'RISK', title: 'High risk', description: 'Desc', priority: 5, status: 'PENDING', createdAt: new Date() },
        { id: '2', level: 'INFO', category: 'AI_USAGE', title: 'Low prio', description: 'Desc', priority: 1, status: 'PENDING', createdAt: new Date() },
      ];
      decisionFindMany.mockResolvedValue(mockDecisions);

      const result = await service.listDecisions('proj-1');
      expect(result).toHaveLength(2);
      expect(decisionFindMany).toHaveBeenCalledWith({
        where: { projectId: 'proj-1' },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      });
    });
  });

  describe('updateDecisionStatus', () => {
    it('updates status to ACCEPTED', async () => {
      decisionFindUnique.mockResolvedValue({ id: 'dec-1', status: 'PENDING' });
      decisionUpdate.mockResolvedValue({ id: 'dec-1', status: 'ACCEPTED', level: 'INFO', category: 'AI_USAGE', title: 'Test', description: 'Desc', priority: 1, createdAt: new Date() });

      const result = await service.updateDecisionStatus('dec-1', 'ACCEPTED');
      expect(result.status).toBe('ACCEPTED');
    });

    it('throws on invalid status', async () => {
      await expect(
        service.updateDecisionStatus('dec-1', 'INVALID'),
      ).rejects.toThrow('Invalid status');
    });

    it('throws when decision not found', async () => {
      decisionFindUnique.mockResolvedValue(null);
      await expect(
        service.updateDecisionStatus('dec-999', 'ACCEPTED'),
      ).rejects.toThrow('Decision not found');
    });
  });
});
