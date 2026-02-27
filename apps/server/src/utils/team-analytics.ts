import { logger } from './logger.js';

export interface IndividualMetrics {
  developerId: string;
  prsOpened: number;
  prsMerged: number;
  aiAssistedPrs: number;
  avgComplexity: number;
  linesChanged: number;
  reviewsGiven: number;
}

export interface TeamAggregate {
  teamId: string;
  memberCount: number;
  totalPrs: number;
  totalAiPrs: number;
  aiAdoptionRate: number;
  avgComplexity: number;
  avgPrsPerDev: number;
  topContributor: string;
  generatedAt: Date;
}

export function aggregateTeamMetrics(teamId: string, members: IndividualMetrics[]): TeamAggregate {
  if (members.length === 0) {
    logger.warn({ teamId }, 'No members to aggregate');
    return {
      teamId,
      memberCount: 0,
      totalPrs: 0,
      totalAiPrs: 0,
      aiAdoptionRate: 0,
      avgComplexity: 0,
      avgPrsPerDev: 0,
      topContributor: 'N/A',
      generatedAt: new Date(),
    };
  }

  const totalPrs = members.reduce((s, m) => s + m.prsMerged, 0);
  const totalAiPrs = members.reduce((s, m) => s + m.aiAssistedPrs, 0);
  const avgComplexity = members.reduce((s, m) => s + m.avgComplexity, 0) / members.length;
  const topContributor = members.reduce((top, m) => m.prsMerged > top.prsMerged ? m : top).developerId;

  const result: TeamAggregate = {
    teamId,
    memberCount: members.length,
    totalPrs,
    totalAiPrs,
    aiAdoptionRate: totalPrs > 0 ? Math.round((totalAiPrs / totalPrs) * 100) : 0,
    avgComplexity: Math.round(avgComplexity * 10) / 10,
    avgPrsPerDev: Math.round((totalPrs / members.length) * 10) / 10,
    topContributor,
    generatedAt: new Date(),
  };

  logger.info({ teamId, memberCount: members.length, totalPrs }, 'Team metrics aggregated');
  return result;
}

export function compareTeams(teams: TeamAggregate[]): Array<{ teamId: string; rank: number; score: number }> {
  const scored = teams.map(t => ({
    teamId: t.teamId,
    score: Math.round(t.aiAdoptionRate * 0.3 + (100 - t.avgComplexity) * 0.3 + Math.min(100, t.avgPrsPerDev * 10) * 0.4),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s, i) => ({ ...s, rank: i + 1 }));
}
