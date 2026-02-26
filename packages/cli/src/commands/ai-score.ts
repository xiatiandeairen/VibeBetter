import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { header, info, warn } from '../utils/display.js';

interface MetricInput {
  aiSuccessRate: number;
  aiStableRate: number;
  psriScore: number;
  coveragePercent: number;
  defectDensity: number;
}

function computeAiScore(m: MetricInput): { score: number; breakdown: Record<string, number> } {
  const successComponent = m.aiSuccessRate * 0.30;
  const stabilityComponent = m.aiStableRate * 0.25;
  const riskComponent = Math.max(0, (100 - m.psriScore)) * 0.20;
  const coverageComponent = m.coveragePercent * 0.15;
  const defectComponent = Math.max(0, 100 - m.defectDensity * 10) * 0.10;

  const score = Math.round(Math.min(100, Math.max(0,
    successComponent + stabilityComponent + riskComponent + coverageComponent + defectComponent
  )));

  return {
    score,
    breakdown: {
      'AI Success Rate (30%)': Math.round(successComponent * 10) / 10,
      'AI Stable Rate (25%)': Math.round(stabilityComponent * 10) / 10,
      'Risk Inverse (20%)': Math.round(riskComponent * 10) / 10,
      'Coverage (15%)': Math.round(coverageComponent * 10) / 10,
      'Defect Inverse (10%)': Math.round(defectComponent * 10) / 10,
    },
  };
}

function scoreGrade(score: number): string {
  if (score >= 90) return pc.green('A+');
  if (score >= 80) return pc.green('A');
  if (score >= 70) return pc.yellow('B');
  if (score >= 60) return pc.yellow('C');
  if (score >= 50) return pc.red('D');
  return pc.red('F');
}

export const aiScoreCommand = new Command('ai-score')
  .description('Compute a single AI effectiveness score (0-100) combining all metrics')
  .option('--success-rate <n>', 'AI success rate (0-100)', '78')
  .option('--stable-rate <n>', 'AI stable rate (0-100)', '85')
  .option('--psri <n>', 'PSRI score (0-100, lower=better)', '35')
  .option('--coverage <n>', 'Test coverage percent', '72')
  .option('--defect-density <n>', 'Defect density per KLOC', '2.1')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('AI Effectiveness Score');

    requireConfig();

    const metrics: MetricInput = {
      aiSuccessRate: parseFloat(opts.successRate),
      aiStableRate: parseFloat(opts.stableRate),
      psriScore: parseFloat(opts.psri),
      coveragePercent: parseFloat(opts.coverage),
      defectDensity: parseFloat(opts.defectDensity),
    };

    const { score, breakdown } = computeAiScore(metrics);

    if (opts.json) {
      console.log(JSON.stringify({ score, grade: score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : score >= 50 ? 'D' : 'F', breakdown }, null, 2));
      return;
    }

    console.log();
    console.log(`  ${pc.bold('Overall AI Score:')} ${pc.bold(pc.cyan(String(score)))} / 100  ${scoreGrade(score)}`);
    console.log();

    for (const [label, value] of Object.entries(breakdown)) {
      const bar = '█'.repeat(Math.round(value / 3));
      console.log(`  ${label.padEnd(28)} ${pc.dim(bar)} ${value}`);
    }

    console.log();

    if (score >= 80) {
      info('AI is providing strong positive impact on engineering quality.');
    } else if (score >= 60) {
      warn('AI impact is moderate — review low-scoring dimensions for improvement.');
    } else {
      warn('AI effectiveness is below expectations — consider tooling or process changes.');
    }
  });
