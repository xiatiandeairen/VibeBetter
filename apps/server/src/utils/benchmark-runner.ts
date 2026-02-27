import { logger } from './logger.js';

export interface BenchmarkSpec {
  id: string;
  name: string;
  metrics: string[];
  weights: Record<string, number>;
}

export interface ProjectMetrics {
  projectId: string;
  values: Record<string, number>;
}

export interface BenchmarkRunResult {
  specId: string;
  projectId: string;
  scores: { metric: string; value: number; weight: number; normalizedScore: number }[];
  overallScore: number;
  runAt: Date;
}

export interface ComparisonResult {
  specId: string;
  baseline: BenchmarkRunResult;
  candidate: BenchmarkRunResult;
  deltas: { metric: string; baselineScore: number; candidateScore: number; delta: number; improved: boolean }[];
  overallDelta: number;
  verdict: 'better' | 'worse' | 'comparable';
}

export function runBenchmark(spec: BenchmarkSpec, project: ProjectMetrics): BenchmarkRunResult {
  const scores = spec.metrics.map(metric => {
    const value = project.values[metric] ?? 0;
    const weight = spec.weights[metric] ?? 1;
    const normalizedScore = Math.min(100, Math.max(0, value));
    return { metric, value, weight, normalizedScore };
  });

  const totalWeight = scores.reduce((s, sc) => s + sc.weight, 0) || 1;
  const overallScore = Math.round(scores.reduce((s, sc) => s + sc.normalizedScore * sc.weight, 0) / totalWeight);

  logger.info({ specId: spec.id, projectId: project.projectId, score: overallScore }, 'Benchmark run complete');
  return { specId: spec.id, projectId: project.projectId, scores, overallScore, runAt: new Date() };
}

export function compareBenchmarks(baseline: BenchmarkRunResult, candidate: BenchmarkRunResult): ComparisonResult {
  const deltas = baseline.scores.map(bs => {
    const cs = candidate.scores.find(s => s.metric === bs.metric);
    const candidateScore = cs?.normalizedScore ?? 0;
    const delta = candidateScore - bs.normalizedScore;
    return { metric: bs.metric, baselineScore: bs.normalizedScore, candidateScore, delta, improved: delta > 0 };
  });

  const overallDelta = candidate.overallScore - baseline.overallScore;
  const verdict: ComparisonResult['verdict'] = overallDelta > 5 ? 'better' : overallDelta < -5 ? 'worse' : 'comparable';

  logger.info({ specId: baseline.specId, overallDelta, verdict }, 'Benchmark comparison complete');
  return { specId: baseline.specId, baseline, candidate, deltas, overallDelta, verdict };
}
