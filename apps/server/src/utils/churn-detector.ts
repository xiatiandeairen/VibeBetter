import { logger } from './logger.js';

export interface FileChange {
  filePath: string;
  commitHash: string;
  date: Date;
  additions: number;
  deletions: number;
  author: string;
}

export interface ChurnResult {
  filePath: string;
  totalChanges: number;
  totalAdditions: number;
  totalDeletions: number;
  churnRatio: number;
  uniqueAuthors: number;
  isHighChurn: boolean;
  pattern: 'rewrite' | 'incremental' | 'stable';
}

export function detectChurn(
  changes: FileChange[],
  highChurnThreshold = 0.7,
): ChurnResult[] {
  const fileMap = new Map<string, FileChange[]>();

  for (const change of changes) {
    const existing = fileMap.get(change.filePath) ?? [];
    existing.push(change);
    fileMap.set(change.filePath, existing);
  }

  const results: ChurnResult[] = [];

  for (const [filePath, fileChanges] of fileMap) {
    const totalAdditions = fileChanges.reduce((s, c) => s + c.additions, 0);
    const totalDeletions = fileChanges.reduce((s, c) => s + c.deletions, 0);
    const churnRatio = totalAdditions > 0
      ? Math.round((totalDeletions / totalAdditions) * 100) / 100
      : 0;

    const uniqueAuthors = new Set(fileChanges.map(c => c.author)).size;
    const isHighChurn = churnRatio >= highChurnThreshold;

    let pattern: ChurnResult['pattern'] = 'stable';
    if (churnRatio > 0.8 && fileChanges.length > 5) pattern = 'rewrite';
    else if (fileChanges.length > 3) pattern = 'incremental';

    results.push({
      filePath,
      totalChanges: fileChanges.length,
      totalAdditions,
      totalDeletions,
      churnRatio,
      uniqueAuthors,
      isHighChurn,
      pattern,
    });
  }

  results.sort((a, b) => b.churnRatio - a.churnRatio);
  logger.info({ filesAnalyzed: results.length, highChurn: results.filter(r => r.isHighChurn).length }, 'Churn detection complete');
  return results;
}
