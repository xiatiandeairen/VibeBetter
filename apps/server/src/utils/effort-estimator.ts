import { logger } from './logger.js';

export interface TaskInput {
  id: string;
  description: string;
  filesAffected: number;
  linesEstimate: number;
  hasTests: boolean;
  hasMigration: boolean;
  dependencies: string[];
}

export interface EffortEstimate {
  id: string;
  description: string;
  complexity: 'trivial' | 'small' | 'medium' | 'large' | 'epic';
  hours: number;
  confidence: number;
  risks: string[];
}

export function estimateEffort(tasks: TaskInput[]): EffortEstimate[] {
  if (tasks.length === 0) {
    logger.warn('No tasks provided for effort estimation');
    return [];
  }

  const results: EffortEstimate[] = [];

  for (const task of tasks) {
    let baseHours = task.linesEstimate / 50;
    if (task.hasTests) baseHours *= 1.4;
    if (task.hasMigration) baseHours *= 1.3;
    baseHours += task.dependencies.length * 2;

    let complexity: EffortEstimate['complexity'];
    if (baseHours <= 2) complexity = 'trivial';
    else if (baseHours <= 8) complexity = 'small';
    else if (baseHours <= 24) complexity = 'medium';
    else if (baseHours <= 60) complexity = 'large';
    else complexity = 'epic';

    const confidence = Math.max(0.3, 1 - (task.filesAffected * 0.05) - (task.dependencies.length * 0.08));

    const risks: string[] = [];
    if (task.hasMigration) risks.push('Database migration required');
    if (task.filesAffected > 10) risks.push('Large blast radius');
    if (task.dependencies.length > 3) risks.push('Many dependencies');

    results.push({
      id: task.id,
      description: task.description,
      complexity,
      hours: Math.round(baseHours),
      confidence: Math.round(confidence * 100) / 100,
      risks,
    });
  }

  logger.info({ tasks: results.length, totalHours: results.reduce((s, r) => s + r.hours, 0) }, 'Effort estimated');
  return results;
}
