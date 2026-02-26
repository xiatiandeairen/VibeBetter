export const INDUSTRY_BENCHMARKS = {
  aiSuccessRate: { poor: 0.5, average: 0.7, good: 0.85, excellent: 0.95 },
  aiStableRate: { poor: 0.6, average: 0.8, good: 0.9, excellent: 0.97 },
  psriScore: { excellent: 0.15, good: 0.3, average: 0.5, poor: 0.7 },
  tdiScore: { excellent: 0.2, good: 0.4, average: 0.6, poor: 0.8 },
} as const;

export function getBenchmarkLevel(
  metric: keyof typeof INDUSTRY_BENCHMARKS,
  value: number,
): string {
  const b = INDUSTRY_BENCHMARKS[metric];
  if (metric === 'psriScore' || metric === 'tdiScore') {
    if (value <= b.excellent) return 'Excellent';
    if (value <= b.good) return 'Good';
    if (value <= b.average) return 'Average';
    return 'Poor';
  }
  if (value >= b.excellent) return 'Excellent';
  if (value >= b.good) return 'Good';
  if (value >= b.average) return 'Average';
  return 'Poor';
}
