import { logger } from './logger.js';

export interface PerformanceMetric {
  area: string;
  currentValue: number;
  threshold: number;
  unit: string;
  improvable: boolean;
}

export interface OptimizationResult {
  area: string;
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  estimatedGain: string;
}

export function suggestOptimizations(metrics: PerformanceMetric[]): OptimizationResult[] {
  if (metrics.length === 0) {
    logger.warn('No performance metrics provided for optimization');
    return [];
  }

  const results: OptimizationResult[] = [];

  for (const m of metrics) {
    if (!m.improvable) continue;

    const ratio = m.currentValue / m.threshold;
    let impact: OptimizationResult['impact'];
    let effort: OptimizationResult['effort'];
    let suggestion: string;

    if (ratio > 2) {
      impact = 'high';
      effort = 'high';
      suggestion = `Critical: ${m.area} is ${ratio.toFixed(1)}x over threshold — needs architectural change`;
    } else if (ratio > 1.5) {
      impact = 'high';
      effort = 'medium';
      suggestion = `${m.area} exceeds threshold by ${Math.round((ratio - 1) * 100)}% — optimize hot paths`;
    } else if (ratio > 1) {
      impact = 'medium';
      effort = 'low';
      suggestion = `${m.area} slightly over threshold — consider caching or indexing`;
    } else {
      impact = 'low';
      effort = 'low';
      suggestion = `${m.area} is within threshold — minor tuning possible`;
    }

    const gain = Math.round((1 - 1 / ratio) * 100);
    results.push({ area: m.area, suggestion, impact, effort, estimatedGain: `~${gain}% improvement` });
  }

  results.sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return impactOrder[a.impact] - impactOrder[b.impact];
  });

  logger.info({ metrics: metrics.length, suggestions: results.length }, 'Optimization suggestions generated');
  return results;
}
