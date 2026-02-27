import { logger } from './logger.js';

export interface AlertRuleInput {
  id: string;
  metric: string;
  condition: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
  cooldownMinutes: number;
  lastTriggeredAt?: Date;
}

export interface AlertEvalResult {
  ruleId: string;
  triggered: boolean;
  currentValue: number;
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suppressedByCooldown: boolean;
}

export function evaluateAlerts(
  rules: AlertRuleInput[],
  currentMetrics: Record<string, number>,
): AlertEvalResult[] {
  const now = new Date();
  const results: AlertEvalResult[] = [];

  for (const rule of rules) {
    const value = currentMetrics[rule.metric];
    if (value === undefined) continue;

    let triggered = false;
    switch (rule.condition) {
      case 'gt': triggered = value > rule.threshold; break;
      case 'lt': triggered = value < rule.threshold; break;
      case 'gte': triggered = value >= rule.threshold; break;
      case 'lte': triggered = value <= rule.threshold; break;
      case 'eq': triggered = value === rule.threshold; break;
    }

    let suppressedByCooldown = false;
    if (triggered && rule.lastTriggeredAt) {
      const elapsed = (now.getTime() - rule.lastTriggeredAt.getTime()) / (1000 * 60);
      if (elapsed < rule.cooldownMinutes) {
        suppressedByCooldown = true;
      }
    }

    const message = triggered
      ? `${rule.metric} (${value}) ${rule.condition} ${rule.threshold}`
      : `${rule.metric} (${value}) within threshold`;

    results.push({
      ruleId: rule.id,
      triggered: triggered && !suppressedByCooldown,
      currentValue: value,
      threshold: rule.threshold,
      severity: rule.severity,
      message,
      suppressedByCooldown,
    });
  }

  const triggeredCount = results.filter(r => r.triggered).length;
  logger.info({ rules: rules.length, triggered: triggeredCount }, 'Alert evaluation complete');
  return results;
}
