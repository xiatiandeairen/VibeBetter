import { logger } from './logger.js';

export interface ProcessMetric {
  name: string;
  avgDurationMinutes: number;
  occurrencesPerWeek: number;
  automatable: boolean;
  valueRatio: number;
}

export interface WasteResult {
  category: string;
  process: string;
  weeklyWasteHours: number;
  suggestion: string;
  savingsIfFixed: number;
}

export function findWaste(metrics: ProcessMetric[]): WasteResult[] {
  if (metrics.length === 0) {
    logger.warn('No process metrics provided for waste detection');
    return [];
  }

  const results: WasteResult[] = [];

  for (const m of metrics) {
    const totalMinutes = m.avgDurationMinutes * m.occurrencesPerWeek;
    const wasteMinutes = totalMinutes * (1 - m.valueRatio);
    const weeklyWasteHours = Math.round((wasteMinutes / 60) * 10) / 10;

    if (weeklyWasteHours < 0.5) continue;

    let category: string;
    let suggestion: string;

    if (m.valueRatio < 0.3) {
      category = 'High waste';
      suggestion = m.automatable ? `Automate "${m.name}" to save ~${weeklyWasteHours}h/week` : `Redesign "${m.name}" process`;
    } else if (m.valueRatio < 0.6) {
      category = 'Medium waste';
      suggestion = `Optimize "${m.name}" — reduce frequency or duration`;
    } else {
      category = 'Low waste';
      suggestion = `Minor optimization opportunity in "${m.name}"`;
    }

    const savingsIfFixed = Math.round(weeklyWasteHours * 0.7 * 10) / 10;

    results.push({ category, process: m.name, weeklyWasteHours, suggestion, savingsIfFixed });
  }

  results.sort((a, b) => b.weeklyWasteHours - a.weeklyWasteHours);

  logger.info({ wasteItems: results.length, totalWeeklyHours: results.reduce((s, r) => s + r.weeklyWasteHours, 0) }, 'Waste detected');
  return results;
}
