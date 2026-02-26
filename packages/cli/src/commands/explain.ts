import { Command } from 'commander';
import pc from 'picocolors';
import { header } from '../utils/display.js';

const METRICS: Record<string, { full: string; description: string; range: string }> = {
  psri: {
    full: 'Project Structural Risk Index',
    description: 'Composite score measuring structural risk across 6 dimensions: structural complexity, change frequency, defect density, architecture risk, runtime risk, and coverage gaps.',
    range: '0.0 (no risk) → 1.0 (critical risk). Below 0.3 is healthy, above 0.6 needs attention.',
  },
  tdi: {
    full: 'Technical Debt Index',
    description: 'Quantifies accumulated technical debt by analyzing code complexity, duplication, coupling, and coverage deficits.',
    range: '0.0 (no debt) → 1.0 (severe debt). Keep below 0.4 for sustainable development.',
  },
  'ai-success': {
    full: 'AI Success Rate',
    description: 'Percentage of AI-assisted pull requests that were merged without major revisions, indicating AI code quality.',
    range: '0% → 100%. Above 85% is excellent, below 70% suggests AI output needs more review.',
  },
  'ai-stable': {
    full: 'AI Stable Rate',
    description: 'Percentage of AI-assisted pull requests that remain stable (no rollbacks) after merge.',
    range: '0% → 100%. Above 95% is excellent.',
  },
  hotspot: {
    full: 'Hotspot Detection',
    description: 'Files with both high cyclomatic complexity AND high change frequency. These are the riskiest files in your codebase.',
    range: 'Count of files exceeding both thresholds. Fewer is better.',
  },
};

export const explainCommand = new Command('explain')
  .description('Explain what VibeBetter metrics mean')
  .argument('[metric]', 'Metric to explain (psri, tdi, ai-success, ai-stable, hotspot)')
  .action(async (metricName?: string) => {
    header('Metric Explanations');

    if (metricName) {
      const m = METRICS[metricName.toLowerCase()];
      if (!m) {
        console.log(pc.red(`  Unknown metric: ${metricName}`));
        console.log(pc.dim(`  Available: ${Object.keys(METRICS).join(', ')}`));
        return;
      }
      console.log(`  ${pc.bold(pc.cyan(m.full))} (${metricName})`);
      console.log();
      console.log(`  ${m.description}`);
      console.log();
      console.log(`  ${pc.dim('Range:')} ${m.range}`);
      console.log();
      return;
    }

    for (const [key, m] of Object.entries(METRICS)) {
      console.log(`  ${pc.bold(pc.cyan(m.full))} ${pc.dim(`(${key})`)}`);
      console.log(`  ${m.description}`);
      console.log(`  ${pc.dim('Range:')} ${m.range}`);
      console.log();
    }
  });
