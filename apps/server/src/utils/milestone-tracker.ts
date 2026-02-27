import { logger } from './logger.js';

export interface MilestoneInput {
  id: string;
  name: string;
  dueDate: Date;
  deliverables: { id: string; completed: boolean; weight: number }[];
}

export interface MilestoneProgress {
  milestoneId: string;
  name: string;
  progress: number;
  daysRemaining: number;
  velocity: number;
  projectedCompletion: Date | null;
  isOnTrack: boolean;
  status: 'on-track' | 'at-risk' | 'behind' | 'completed';
}

export function trackMilestoneProgress(milestones: MilestoneInput[]): MilestoneProgress[] {
  const now = new Date();
  const results: MilestoneProgress[] = [];

  for (const ms of milestones) {
    const totalWeight = ms.deliverables.reduce((s, d) => s + d.weight, 0) || 1;
    const completedWeight = ms.deliverables.filter(d => d.completed).reduce((s, d) => s + d.weight, 0);
    const progress = Math.round((completedWeight / totalWeight) * 100);

    const daysRemaining = Math.max(0, Math.ceil((ms.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const daysSinceStart = 30;
    const velocity = daysSinceStart > 0 ? progress / daysSinceStart : 0;

    let projectedCompletion: Date | null = null;
    if (velocity > 0 && progress < 100) {
      const daysToComplete = (100 - progress) / velocity;
      projectedCompletion = new Date(now.getTime() + daysToComplete * 24 * 60 * 60 * 1000);
    }

    const isOnTrack = progress >= 100 || (projectedCompletion !== null && projectedCompletion <= ms.dueDate);
    let status: MilestoneProgress['status'];
    if (progress >= 100) status = 'completed';
    else if (isOnTrack) status = 'on-track';
    else if (daysRemaining > 7) status = 'at-risk';
    else status = 'behind';

    results.push({
      milestoneId: ms.id,
      name: ms.name,
      progress,
      daysRemaining,
      velocity: Math.round(velocity * 100) / 100,
      projectedCompletion,
      isOnTrack,
      status,
    });
  }

  logger.info({ milestones: results.length, onTrack: results.filter(r => r.isOnTrack).length }, 'Milestone progress tracked');
  return results;
}
