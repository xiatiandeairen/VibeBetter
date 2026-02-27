import { logger } from './logger.js';

export interface CommitFileSet {
  commitHash: string;
  files: string[];
  date: Date;
}

export interface CouplingResult {
  fileA: string;
  fileB: string;
  coChangeCount: number;
  strength: number;
  type: 'temporal';
}

export function calculateCoupling(
  commitSets: CommitFileSet[],
  minCoChanges = 3,
  minStrength = 0.3,
): CouplingResult[] {
  if (commitSets.length === 0) {
    logger.warn('No commit sets provided for coupling calculation');
    return [];
  }

  const fileCommitCount = new Map<string, number>();
  const pairCount = new Map<string, number>();

  for (const cs of commitSets) {
    const files = [...new Set(cs.files)];
    for (const f of files) {
      fileCommitCount.set(f, (fileCommitCount.get(f) ?? 0) + 1);
    }

    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        const key = [files[i], files[j]].sort().join('::');
        pairCount.set(key, (pairCount.get(key) ?? 0) + 1);
      }
    }
  }

  const results: CouplingResult[] = [];

  for (const [key, count] of pairCount.entries()) {
    if (count < minCoChanges) continue;

    const [fileA, fileB] = key.split('::') as [string, string];
    const maxCommits = Math.max(fileCommitCount.get(fileA) ?? 1, fileCommitCount.get(fileB) ?? 1);
    const strength = Math.round((count / maxCommits) * 100) / 100;

    if (strength < minStrength) continue;

    results.push({ fileA, fileB, coChangeCount: count, strength, type: 'temporal' });
  }

  results.sort((a, b) => b.strength - a.strength);

  logger.info({ pairs: results.length, totalCommits: commitSets.length }, 'Coupling calculated');
  return results;
}
