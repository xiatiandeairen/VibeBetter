import { logger } from './logger.js';

export interface BlameEntry {
  filePath: string;
  authorEmail: string;
  linesOwned: number;
  lastCommitDate: Date;
  totalCommits: number;
}

export interface ExpertiseResult {
  filePath: string;
  experts: Array<{
    email: string;
    score: number;
    linesOwned: number;
    commits: number;
    recency: 'recent' | 'moderate' | 'stale';
  }>;
  busFactor: number;
  risk: 'low' | 'medium' | 'high';
}

export function analyzeExpertise(entries: BlameEntry[]): ExpertiseResult[] {
  const fileMap = new Map<string, BlameEntry[]>();
  for (const entry of entries) {
    const existing = fileMap.get(entry.filePath) ?? [];
    existing.push(entry);
    fileMap.set(entry.filePath, existing);
  }

  const results: ExpertiseResult[] = [];
  const now = Date.now();

  for (const [filePath, fileEntries] of fileMap) {
    const totalLines = fileEntries.reduce((s, e) => s + e.linesOwned, 0);

    const experts = fileEntries.map(e => {
      const daysSinceCommit = (now - e.lastCommitDate.getTime()) / (1000 * 60 * 60 * 24);
      const recency = daysSinceCommit < 30 ? 'recent' as const : daysSinceCommit < 90 ? 'moderate' as const : 'stale' as const;
      const recencyMultiplier = recency === 'recent' ? 1.0 : recency === 'moderate' ? 0.7 : 0.4;
      const ownershipScore = totalLines > 0 ? e.linesOwned / totalLines : 0;
      const score = Math.round((ownershipScore * 60 + Math.min(1, e.totalCommits / 20) * 40) * recencyMultiplier);

      return { email: e.authorEmail, score, linesOwned: e.linesOwned, commits: e.totalCommits, recency };
    }).sort((a, b) => b.score - a.score);

    const busFactor = experts.filter(e => e.score >= 30).length;
    const risk = busFactor <= 1 ? 'high' : busFactor <= 2 ? 'medium' : 'low';

    results.push({ filePath, experts, busFactor, risk });
  }

  logger.info({ filesAnalyzed: results.length }, 'Expertise analysis complete');
  return results;
}
