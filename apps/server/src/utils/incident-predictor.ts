import { logger } from './logger.js';

export interface MetricSnapshot {
  timestamp: Date;
  errorRate: number;
  responseTimeP99: number;
  cpuUsage: number;
  memoryUsage: number;
  deployFrequency: number;
  changeFailRate: number;
}

export interface IncidentPrediction {
  area: string;
  probability: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  triggeringFactors: string[];
  suggestedActions: string[];
  confidence: number;
}

export function predictIncidents(snapshots: MetricSnapshot[]): IncidentPrediction[] {
  if (snapshots.length === 0) {
    logger.warn('No metric snapshots provided for incident prediction');
    return [];
  }

  const latest = snapshots[snapshots.length - 1]!;
  const predictions: IncidentPrediction[] = [];

  if (latest.errorRate > 5) {
    const prob = Math.min(95, Math.round(latest.errorRate * 8));
    predictions.push({
      area: 'service-reliability',
      probability: prob,
      riskLevel: prob > 70 ? 'critical' : prob > 40 ? 'high' : 'medium',
      triggeringFactors: [`Error rate at ${latest.errorRate}%`],
      suggestedActions: ['Investigate error logs', 'Check recent deployments', 'Enable circuit breakers'],
      confidence: 80,
    });
  }

  if (latest.responseTimeP99 > 2000) {
    const prob = Math.min(90, Math.round(latest.responseTimeP99 / 50));
    predictions.push({
      area: 'performance-degradation',
      probability: prob,
      riskLevel: prob > 60 ? 'high' : 'medium',
      triggeringFactors: [`P99 latency at ${latest.responseTimeP99}ms`],
      suggestedActions: ['Profile slow endpoints', 'Check database queries', 'Scale horizontally'],
      confidence: 75,
    });
  }

  if (latest.memoryUsage > 85) {
    predictions.push({
      area: 'resource-exhaustion',
      probability: Math.min(90, Math.round(latest.memoryUsage * 0.9)),
      riskLevel: latest.memoryUsage > 95 ? 'critical' : 'high',
      triggeringFactors: [`Memory at ${latest.memoryUsage}%`],
      suggestedActions: ['Check for memory leaks', 'Increase memory limits', 'Optimize caching'],
      confidence: 85,
    });
  }

  if (latest.changeFailRate > 20) {
    predictions.push({
      area: 'deployment-stability',
      probability: Math.round(latest.changeFailRate * 1.5),
      riskLevel: latest.changeFailRate > 40 ? 'high' : 'medium',
      triggeringFactors: [`Change failure rate at ${latest.changeFailRate}%`],
      suggestedActions: ['Improve test coverage', 'Add canary deployments', 'Review rollback procedures'],
      confidence: 70,
    });
  }

  predictions.sort((a, b) => b.probability - a.probability);
  logger.info({ predictionCount: predictions.length }, 'Incident predictions generated');
  return predictions;
}
