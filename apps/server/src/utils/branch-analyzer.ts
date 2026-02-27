import { logger } from './logger.js';

export interface BranchRecord {
  name: string;
  lastCommitAt: Date;
  createdAt: Date;
  author: string;
  behindMain: number;
  aheadOfMain: number;
  hasConflicts: boolean;
}

export interface BranchHealthResult {
  name: string;
  status: 'healthy' | 'stale' | 'conflict' | 'abandoned';
  ageDays: number;
  staleDays: number;
  recommendation: string;
}

export function analyzeBranchHealth(
  branches: BranchRecord[],
  staleDays = 14,
  abandonedDays = 30,
): BranchHealthResult[] {
  if (branches.length === 0) {
    logger.warn('No branches provided for health analysis');
    return [];
  }

  const now = Date.now();
  const msPerDay = 24 * 60 * 60 * 1000;
  const results: BranchHealthResult[] = [];

  for (const branch of branches) {
    const ageDays = Math.round((now - branch.createdAt.getTime()) / msPerDay);
    const sinceLastCommit = Math.round((now - branch.lastCommitAt.getTime()) / msPerDay);

    let status: BranchHealthResult['status'];
    let recommendation: string;

    if (branch.hasConflicts) {
      status = 'conflict';
      recommendation = 'Rebase or merge main to resolve conflicts';
    } else if (sinceLastCommit >= abandonedDays) {
      status = 'abandoned';
      recommendation = 'Consider deleting this branch';
    } else if (sinceLastCommit >= staleDays) {
      status = 'stale';
      recommendation = 'Rebase on main or close if no longer needed';
    } else {
      status = 'healthy';
      recommendation = 'No action needed';
    }

    results.push({ name: branch.name, status, ageDays, staleDays: sinceLastCommit, recommendation });
  }

  logger.info({
    total: results.length,
    healthy: results.filter(r => r.status === 'healthy').length,
    stale: results.filter(r => r.status === 'stale').length,
  }, 'Branch health analyzed');

  return results;
}
