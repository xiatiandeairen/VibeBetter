import { logger } from './logger.js';

export interface PipelineStep {
  id: string;
  name: string;
  avgDurationMinutes: number;
  p95DurationMinutes: number;
  throughputPerDay: number;
  queueDepth: number;
}

export interface BottleneckReport {
  steps: AnalyzedStep[];
  overallEfficiency: number;
  criticalPath: string[];
  recommendations: string[];
}

export interface AnalyzedStep {
  id: string;
  name: string;
  utilization: number;
  isBottleneck: boolean;
  waitRatio: number;
  impactScore: number;
}

export function analyzeBottlenecks(
  steps: PipelineStep[],
  targetThroughput: number,
): BottleneckReport {
  const maxThroughput = Math.max(...steps.map(s => s.throughputPerDay), 1);

  const analyzed: AnalyzedStep[] = steps.map(step => {
    const utilization = Math.round((step.throughputPerDay / maxThroughput) * 100);
    const waitRatio = step.queueDepth > 0 ? Math.round((step.queueDepth / step.throughputPerDay) * 100) / 100 : 0;
    const isBottleneck = step.throughputPerDay < targetThroughput || utilization > 85;
    const impactScore = isBottleneck ? Math.round((targetThroughput - step.throughputPerDay) / targetThroughput * 100) : 0;

    return { id: step.id, name: step.name, utilization, isBottleneck, waitRatio, impactScore };
  });

  const bottlenecks = analyzed.filter(s => s.isBottleneck).sort((a, b) => b.impactScore - a.impactScore);
  const criticalPath = bottlenecks.map(b => b.name);

  const recommendations: string[] = [];
  for (const bn of bottlenecks) {
    if (bn.waitRatio > 1) {
      recommendations.push(`${bn.name}: Reduce queue depth (current wait ratio: ${bn.waitRatio})`);
    }
    if (bn.utilization > 90) {
      recommendations.push(`${bn.name}: Add capacity or parallelize (${bn.utilization}% utilized)`);
    }
  }

  const totalSteps = analyzed.length;
  const efficientSteps = analyzed.filter(s => !s.isBottleneck).length;
  const overallEfficiency = Math.round((efficientSteps / Math.max(totalSteps, 1)) * 100);

  logger.info({ steps: totalSteps, bottlenecks: bottlenecks.length, efficiency: overallEfficiency }, 'Bottleneck analysis complete');
  return { steps: analyzed, overallEfficiency, criticalPath, recommendations };
}
