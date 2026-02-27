import { logger } from './logger.js';

export interface TeamMember {
  id: string;
  name: string;
  availableHoursPerSprint: number;
  skills: string[];
  onLeave: boolean;
}

export interface WorkItem {
  id: string;
  title: string;
  estimatedHours: number;
  requiredSkills: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface CapacityResult {
  totalCapacityHours: number;
  totalDemandHours: number;
  utilizationPct: number;
  isOverCommitted: boolean;
  unassignableItems: string[];
  recommendations: string[];
}

export function modelCapacity(
  team: TeamMember[],
  workItems: WorkItem[],
  bufferPct = 20,
): CapacityResult {
  const activeMembers = team.filter(m => !m.onLeave);
  const totalCapacity = activeMembers.reduce((s, m) => s + m.availableHoursPerSprint, 0);
  const effectiveCapacity = totalCapacity * (1 - bufferPct / 100);
  const totalDemand = workItems.reduce((s, w) => s + w.estimatedHours, 0);

  const teamSkills = new Set(activeMembers.flatMap(m => m.skills));
  const unassignableItems: string[] = [];

  for (const item of workItems) {
    const hasSkills = item.requiredSkills.every(s => teamSkills.has(s));
    if (!hasSkills) unassignableItems.push(item.id);
  }

  const utilizationPct = Math.round((totalDemand / Math.max(effectiveCapacity, 1)) * 100);
  const isOverCommitted = totalDemand > effectiveCapacity;

  const recommendations: string[] = [];
  if (isOverCommitted) {
    const excess = totalDemand - effectiveCapacity;
    recommendations.push(`Over-committed by ${Math.round(excess)}h — consider deferring low-priority items`);
  }
  if (utilizationPct < 60) {
    recommendations.push('Under-utilized — team can take on more work');
  }
  if (unassignableItems.length > 0) {
    recommendations.push(`${unassignableItems.length} items lack required skills — consider training or hiring`);
  }
  if (activeMembers.length < team.length) {
    const onLeave = team.length - activeMembers.length;
    recommendations.push(`${onLeave} team members on leave — adjust expectations`);
  }

  const result: CapacityResult = {
    totalCapacityHours: Math.round(effectiveCapacity),
    totalDemandHours: totalDemand,
    utilizationPct,
    isOverCommitted,
    unassignableItems,
    recommendations,
  };

  logger.info({ capacity: result.totalCapacityHours, demand: totalDemand, utilization: utilizationPct }, 'Capacity model generated');
  return result;
}
