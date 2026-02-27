import { logger } from './logger.js';

export interface MetricDataPoint {
  timestamp: Date;
  metric: string;
  value: number;
}

export interface DetectedPattern {
  name: string;
  metric: string;
  type: 'spike' | 'drop' | 'trend' | 'cycle' | 'anomaly';
  confidence: number;
  startDate: Date;
  endDate: Date;
  description: string;
}

export function detectPatterns(dataPoints: MetricDataPoint[], lookbackDays = 30): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const byMetric = new Map<string, MetricDataPoint[]>();

  for (const dp of dataPoints) {
    const existing = byMetric.get(dp.metric) ?? [];
    existing.push(dp);
    byMetric.set(dp.metric, existing);
  }

  for (const [metric, points] of byMetric.entries()) {
    const sorted = points.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    if (sorted.length < 3) continue;

    const values = sorted.map(p => p.value);
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length);

    for (let i = 1; i < values.length; i++) {
      const val = values[i]!;
      const pt = sorted[i]!;
      if (Math.abs(val - mean) > 2 * stdDev) {
        patterns.push({
          name: `${metric} anomaly`,
          metric,
          type: val > mean ? 'spike' : 'drop',
          confidence: Math.min(0.95, 0.7 + (Math.abs(val - mean) / (3 * stdDev)) * 0.25),
          startDate: pt.timestamp,
          endDate: pt.timestamp,
          description: `${metric} deviated ${Math.round(Math.abs(val - mean))} from mean (${Math.round(mean)})`,
        });
      }
    }

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((s, v) => s + v, 0) / Math.max(firstHalf.length, 1);
    const secondAvg = secondHalf.reduce((s, v) => s + v, 0) / Math.max(secondHalf.length, 1);
    const trendDelta = secondAvg - firstAvg;

    if (Math.abs(trendDelta) > stdDev * 0.5) {
      patterns.push({
        name: `${metric} trend`,
        metric,
        type: 'trend',
        confidence: Math.min(0.9, 0.6 + Math.abs(trendDelta) / (mean || 1) * 0.3),
        startDate: sorted[0]!.timestamp,
        endDate: sorted[sorted.length - 1]!.timestamp,
        description: `${metric} ${trendDelta > 0 ? 'increasing' : 'decreasing'} trend over ${lookbackDays}d`,
      });
    }
  }

  logger.info({ dataPoints: dataPoints.length, patternsFound: patterns.length }, 'Pattern detection complete');
  return patterns;
}
