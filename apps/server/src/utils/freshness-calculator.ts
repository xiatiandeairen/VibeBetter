import { logger } from './logger.js';

export interface FileRecord {
  path: string;
  lastModifiedAt: Date;
  lastAuthor: string;
  lines: number;
}

export interface FreshnessResult {
  path: string;
  daysSinceTouch: number;
  freshness: 'fresh' | 'aging' | 'stale' | 'ancient';
  lines: number;
  lastAuthor: string;
}

export function calculateFreshness(
  files: FileRecord[],
  freshDays = 30,
  agingDays = 90,
  staleDays = 180,
): FreshnessResult[] {
  if (files.length === 0) {
    logger.warn('No files provided for freshness calculation');
    return [];
  }

  const now = Date.now();
  const msPerDay = 24 * 60 * 60 * 1000;
  const results: FreshnessResult[] = [];

  for (const file of files) {
    const daysSinceTouch = Math.round((now - file.lastModifiedAt.getTime()) / msPerDay);

    let freshness: FreshnessResult['freshness'];
    if (daysSinceTouch <= freshDays) {
      freshness = 'fresh';
    } else if (daysSinceTouch <= agingDays) {
      freshness = 'aging';
    } else if (daysSinceTouch <= staleDays) {
      freshness = 'stale';
    } else {
      freshness = 'ancient';
    }

    results.push({
      path: file.path,
      daysSinceTouch,
      freshness,
      lines: file.lines,
      lastAuthor: file.lastAuthor,
    });
  }

  results.sort((a, b) => b.daysSinceTouch - a.daysSinceTouch);

  logger.info({
    totalFiles: results.length,
    fresh: results.filter(r => r.freshness === 'fresh').length,
    stale: results.filter(r => r.freshness === 'stale' || r.freshness === 'ancient').length,
  }, 'Code freshness calculated');

  return results;
}
