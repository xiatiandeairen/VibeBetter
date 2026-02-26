import { logger } from './logger.js';

export interface PerformanceBudget {
  endpoint: string;
  maxResponseTimeMs: number;
  maxP95Ms: number;
  maxP99Ms: number;
  maxErrorRate: number;
  maxPayloadSizeKB: number;
}

export interface BudgetCheckResult {
  endpoint: string;
  metric: string;
  budget: number;
  actual: number;
  passed: boolean;
  overshootPercent: number | null;
}

const DEFAULT_BUDGETS: PerformanceBudget[] = [
  { endpoint: '/api/health', maxResponseTimeMs: 100, maxP95Ms: 200, maxP99Ms: 500, maxErrorRate: 0.01, maxPayloadSizeKB: 1 },
  { endpoint: '/api/metrics', maxResponseTimeMs: 500, maxP95Ms: 1000, maxP99Ms: 2000, maxErrorRate: 0.05, maxPayloadSizeKB: 50 },
  { endpoint: '/api/reports', maxResponseTimeMs: 2000, maxP95Ms: 5000, maxP99Ms: 10000, maxErrorRate: 0.05, maxPayloadSizeKB: 200 },
  { endpoint: '/api/sync', maxResponseTimeMs: 3000, maxP95Ms: 8000, maxP99Ms: 15000, maxErrorRate: 0.1, maxPayloadSizeKB: 500 },
];

export function getDefaultBudgets(): PerformanceBudget[] {
  return [...DEFAULT_BUDGETS];
}

export function checkBudget(
  budget: PerformanceBudget,
  actual: { responseTimeMs: number; p95Ms: number; p99Ms: number; errorRate: number; payloadSizeKB: number },
): BudgetCheckResult[] {
  const results: BudgetCheckResult[] = [];

  const checks: Array<{ metric: string; budgetVal: number; actualVal: number }> = [
    { metric: 'responseTime', budgetVal: budget.maxResponseTimeMs, actualVal: actual.responseTimeMs },
    { metric: 'p95', budgetVal: budget.maxP95Ms, actualVal: actual.p95Ms },
    { metric: 'p99', budgetVal: budget.maxP99Ms, actualVal: actual.p99Ms },
    { metric: 'errorRate', budgetVal: budget.maxErrorRate, actualVal: actual.errorRate },
    { metric: 'payloadSize', budgetVal: budget.maxPayloadSizeKB, actualVal: actual.payloadSizeKB },
  ];

  for (const check of checks) {
    const passed = check.actualVal <= check.budgetVal;
    const overshootPercent = passed
      ? null
      : Math.round(((check.actualVal - check.budgetVal) / check.budgetVal) * 100);

    results.push({
      endpoint: budget.endpoint,
      metric: check.metric,
      budget: check.budgetVal,
      actual: check.actualVal,
      passed,
      overshootPercent,
    });

    if (!passed) {
      logger.warn(
        { endpoint: budget.endpoint, metric: check.metric, budget: check.budgetVal, actual: check.actualVal },
        `Performance budget exceeded for ${budget.endpoint} (${check.metric})`,
      );
    }
  }

  return results;
}

export function checkAllBudgets(
  actuals: Map<string, { responseTimeMs: number; p95Ms: number; p99Ms: number; errorRate: number; payloadSizeKB: number }>,
  budgets: PerformanceBudget[] = DEFAULT_BUDGETS,
): { passed: boolean; results: BudgetCheckResult[] } {
  const allResults: BudgetCheckResult[] = [];

  for (const budget of budgets) {
    const actual = actuals.get(budget.endpoint);
    if (!actual) continue;
    allResults.push(...checkBudget(budget, actual));
  }

  const passed = allResults.every(r => r.passed);

  if (!passed) {
    const failures = allResults.filter(r => !r.passed);
    logger.warn({ failureCount: failures.length }, 'Performance budget check failed');
  }

  return { passed, results: allResults };
}
