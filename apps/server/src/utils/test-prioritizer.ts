import { logger } from './logger.js';

export interface TestRecord {
  file: string;
  lastRun: Date | null;
  lastFailed: Date | null;
  failCount: number;
  linesChanged: number;
  complexity: number;
}

export interface PrioritizedTest {
  file: string;
  score: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
}

export function prioritizeTests(
  tests: TestRecord[],
  riskWeight = 0.4,
  churnWeight = 0.3,
  failWeight = 0.3,
): PrioritizedTest[] {
  if (tests.length === 0) {
    logger.warn('No test records provided for prioritization');
    return [];
  }

  const maxComplexity = Math.max(...tests.map(t => t.complexity), 1);
  const maxLines = Math.max(...tests.map(t => t.linesChanged), 1);
  const maxFails = Math.max(...tests.map(t => t.failCount), 1);

  const results: PrioritizedTest[] = tests.map(t => {
    const riskScore = (t.complexity / maxComplexity) * riskWeight;
    const churnScore = (t.linesChanged / maxLines) * churnWeight;
    const failScore = (t.failCount / maxFails) * failWeight;
    const total = Math.round((riskScore + churnScore + failScore) * 100);

    let priority: PrioritizedTest['priority'];
    let reason: string;

    if (total >= 75) {
      priority = 'critical';
      reason = 'High risk, high churn, frequent failures';
    } else if (total >= 50) {
      priority = 'high';
      reason = 'Significant risk or recent failures';
    } else if (total >= 25) {
      priority = 'medium';
      reason = 'Moderate risk profile';
    } else {
      priority = 'low';
      reason = 'Low risk, stable test';
    }

    return { file: t.file, score: total, priority, reason };
  });

  results.sort((a, b) => b.score - a.score);

  logger.info({ totalTests: results.length, critical: results.filter(r => r.priority === 'critical').length }, 'Tests prioritized');
  return results;
}
