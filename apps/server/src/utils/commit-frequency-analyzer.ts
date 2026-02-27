import { logger } from './logger.js';

export interface CommitRecord {
  hash: string;
  author: string;
  date: Date;
  additions: number;
  deletions: number;
  message: string;
}

export interface FrequencyBucket {
  label: string;
  commits: number;
  authors: number;
  avgSize: number;
}

export function analyzeCommitFrequency(
  commits: CommitRecord[],
  bucketType: 'daily' | 'weekly' | 'hourly' = 'daily',
): FrequencyBucket[] {
  if (commits.length === 0) {
    logger.warn('No commits provided for frequency analysis');
    return [];
  }

  const buckets = new Map<string, { commits: CommitRecord[]; authors: Set<string> }>();

  for (const commit of commits) {
    let key: string;
    const d = commit.date;

    if (bucketType === 'hourly') {
      key = `${d.getHours()}:00`;
    } else if (bucketType === 'weekly') {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      key = dayNames[d.getDay()]!;
    } else {
      key = d.toISOString().slice(0, 10);
    }

    const existing = buckets.get(key) ?? { commits: [], authors: new Set<string>() };
    existing.commits.push(commit);
    existing.authors.add(commit.author);
    buckets.set(key, existing);
  }

  const results: FrequencyBucket[] = [];
  for (const [label, data] of buckets.entries()) {
    const totalSize = data.commits.reduce((s, c) => s + c.additions + c.deletions, 0);
    results.push({
      label,
      commits: data.commits.length,
      authors: data.authors.size,
      avgSize: Math.round(totalSize / data.commits.length),
    });
  }

  results.sort((a, b) => b.commits - a.commits);

  logger.info({ buckets: results.length, totalCommits: commits.length, bucketType }, 'Commit frequency analyzed');
  return results;
}
