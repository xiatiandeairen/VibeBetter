import { logger } from './logger.js';

export interface PrRecord {
  id: string;
  mergedAt: Date | null;
  createdAt: Date;
  author: string;
  linesChanged: number;
  reviewTimeHours: number;
}

export interface VelocityResult {
  sprintLabel: string;
  prsMerged: number;
  avgCycleTimeDays: number;
  linesDelivered: number;
  velocity: number;
  teamSize: number;
}

export function calculateTeamVelocity(
  prs: PrRecord[],
  sprintLengthDays: number,
  sprintCount: number,
): VelocityResult[] {
  const merged = prs.filter(pr => pr.mergedAt !== null).sort(
    (a, b) => (a.mergedAt as Date).getTime() - (b.mergedAt as Date).getTime(),
  );

  if (merged.length === 0) {
    logger.warn('No merged PRs found for velocity calculation');
    return [];
  }

  const earliest = (merged[0]!.mergedAt as Date).getTime();
  const msPerSprint = sprintLengthDays * 24 * 60 * 60 * 1000;
  const results: VelocityResult[] = [];

  for (let i = 0; i < sprintCount; i++) {
    const sprintStart = earliest + i * msPerSprint;
    const sprintEnd = sprintStart + msPerSprint;

    const sprintPrs = merged.filter(pr => {
      const t = (pr.mergedAt as Date).getTime();
      return t >= sprintStart && t < sprintEnd;
    });

    const uniqueAuthors = new Set(sprintPrs.map(p => p.author)).size;
    const totalLines = sprintPrs.reduce((s, p) => s + p.linesChanged, 0);
    const avgCycle = sprintPrs.length > 0
      ? sprintPrs.reduce((s, p) => s + ((p.mergedAt as Date).getTime() - p.createdAt.getTime()), 0)
        / sprintPrs.length / (24 * 60 * 60 * 1000)
      : 0;

    results.push({
      sprintLabel: `Sprint ${i + 1}`,
      prsMerged: sprintPrs.length,
      avgCycleTimeDays: Math.round(avgCycle * 10) / 10,
      linesDelivered: totalLines,
      velocity: sprintPrs.length,
      teamSize: uniqueAuthors,
    });
  }

  logger.info({ sprintCount: results.length, totalPrs: merged.length }, 'Team velocity calculated');
  return results;
}
