import { logger } from './logger.js';

export interface DigestInput {
  projectId: string;
  period: 'daily' | 'weekly';
  metrics: Record<string, number>;
  previousMetrics: Record<string, number>;
}

export interface DigestOutput {
  sections: DigestOutputSection[];
  generatedAt: Date;
  summary: string;
}

export interface DigestOutputSection {
  name: string;
  entries: { label: string; current: number; previous: number; delta: number; trend: string }[];
}

export function generateDigest(input: DigestInput): DigestOutput {
  const sections: DigestOutputSection[] = [];
  const metricGroups: Record<string, string[]> = {
    Quality: ['complexity', 'coverage', 'debt', 'hotspots'],
    Velocity: ['prsPerDay', 'cycleTime', 'throughput'],
    AI: ['aiSuccessRate', 'aiAdoption', 'aiStableRate'],
  };

  for (const [groupName, metricNames] of Object.entries(metricGroups)) {
    const entries = metricNames
      .filter(m => m in input.metrics)
      .map(m => {
        const current = input.metrics[m] ?? 0;
        const previous = input.previousMetrics[m] ?? current;
        const delta = current - previous;
        const trend = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
        return { label: m, current, previous, delta, trend };
      });
    if (entries.length > 0) {
      sections.push({ name: groupName, entries });
    }
  }

  const improving = sections.flatMap(s => s.entries).filter(e => e.trend === 'up').length;
  const declining = sections.flatMap(s => s.entries).filter(e => e.trend === 'down').length;
  const summary = `${input.period} digest: ${improving} improving, ${declining} declining metrics`;

  logger.info({ projectId: input.projectId, period: input.period, sections: sections.length }, 'Digest generated');
  return { sections, generatedAt: new Date(), summary };
}
