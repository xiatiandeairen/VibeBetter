import { logger } from './logger.js';

export interface OKRMetricBinding {
  keyResultId: string;
  metricName: string;
  transform: 'direct' | 'inverse' | 'percentage';
}

export interface OKRSnapshot {
  objectiveId: string;
  progress: number;
  keyResultProgress: { id: string; current: number; target: number; progress: number }[];
  updatedAt: Date;
}

export function trackOKRProgress(
  bindings: OKRMetricBinding[],
  currentMetrics: Record<string, number>,
  targets: Record<string, { start: number; target: number }>,
): OKRSnapshot[] {
  const byObjective = new Map<string, { id: string; current: number; target: number; progress: number }[]>();

  for (const binding of bindings) {
    const metricValue = currentMetrics[binding.metricName];
    if (metricValue === undefined) continue;

    const target = targets[binding.keyResultId];
    if (!target) continue;

    const range = Math.abs(target.target - target.start) || 1;
    let progress: number;

    if (binding.transform === 'inverse') {
      progress = Math.round(((target.start - metricValue) / range) * 100);
    } else {
      progress = Math.round(((metricValue - target.start) / range) * 100);
    }
    progress = Math.max(0, Math.min(100, progress));

    const objectiveId = binding.keyResultId.split('-').slice(0, 2).join('-');
    const existing = byObjective.get(objectiveId) ?? [];
    existing.push({ id: binding.keyResultId, current: metricValue, target: target.target, progress });
    byObjective.set(objectiveId, existing);
  }

  const snapshots: OKRSnapshot[] = [];
  for (const [objectiveId, krs] of byObjective.entries()) {
    const overallProgress = Math.round(krs.reduce((s, kr) => s + kr.progress, 0) / Math.max(krs.length, 1));
    snapshots.push({
      objectiveId,
      progress: overallProgress,
      keyResultProgress: krs,
      updatedAt: new Date(),
    });
  }

  logger.info({ objectives: snapshots.length, bindings: bindings.length }, 'OKR progress tracked');
  return snapshots;
}
