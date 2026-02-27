import { logger } from './logger.js';

export interface TestRun {
  testId: string;
  name: string;
  suite: string;
  passed: boolean;
  duration: number;
  runDate: Date;
}

export interface RegressionResult {
  testId: string;
  name: string;
  suite: string;
  type: 'regression' | 'flaky' | 'new-failure' | 'fixed';
  currentPassed: boolean;
  previousPassed: boolean;
  avgDuration: number;
}

export function detectRegressions(currentRun: TestRun[], previousRun: TestRun[]): RegressionResult[] {
  if (currentRun.length === 0) {
    logger.warn('No current test run data provided');
    return [];
  }

  const prevMap = new Map(previousRun.map(t => [t.testId, t]));
  const results: RegressionResult[] = [];

  for (const test of currentRun) {
    const prev = prevMap.get(test.testId);

    if (!prev) {
      if (!test.passed) {
        results.push({
          testId: test.testId, name: test.name, suite: test.suite,
          type: 'new-failure', currentPassed: false, previousPassed: false, avgDuration: test.duration,
        });
      }
      continue;
    }

    if (prev.passed && !test.passed) {
      results.push({
        testId: test.testId, name: test.name, suite: test.suite,
        type: 'regression', currentPassed: false, previousPassed: true, avgDuration: (test.duration + prev.duration) / 2,
      });
    } else if (!prev.passed && test.passed) {
      results.push({
        testId: test.testId, name: test.name, suite: test.suite,
        type: 'fixed', currentPassed: true, previousPassed: false, avgDuration: (test.duration + prev.duration) / 2,
      });
    }
  }

  results.sort((a, b) => (a.type === 'regression' ? 0 : 1) - (b.type === 'regression' ? 0 : 1));
  logger.info({ total: currentRun.length, regressions: results.filter(r => r.type === 'regression').length }, 'Regression detection complete');
  return results;
}
