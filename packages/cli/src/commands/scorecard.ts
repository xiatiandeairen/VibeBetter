import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

interface Dimension {
  name: string;
  score: number;
  grade: string;
  color: (s: string) => string;
}

function toGrade(score: number): { grade: string; color: (s: string) => string } {
  if (score >= 90) return { grade: 'A', color: pc.green };
  if (score >= 80) return { grade: 'B', color: pc.cyan };
  if (score >= 70) return { grade: 'C', color: pc.yellow };
  if (score >= 60) return { grade: 'D', color: pc.magenta };
  return { grade: 'F', color: pc.red };
}

function normalizeScore(value: number | null, inverted: boolean, max = 1): number {
  if (value === null) return 0;
  const raw = Math.min(value / max, 1);
  return Math.round((inverted ? 1 - raw : raw) * 100);
}

export const scorecardCommand = new Command('scorecard')
  .description('Project scorecard with letter grades per dimension')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Project Scorecard');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    const dimensions: Dimension[] = [
      { name: 'Risk (PSRI)', ...toGrade(normalizeScore(overview.psriScore, true)), score: normalizeScore(overview.psriScore, true) },
      { name: 'Tech Debt (TDI)', ...toGrade(normalizeScore(overview.tdiScore, true)), score: normalizeScore(overview.tdiScore, true) },
      { name: 'AI Effectiveness', ...toGrade(normalizeScore(overview.aiSuccessRate, false)), score: normalizeScore(overview.aiSuccessRate, false) },
      { name: 'Code Coverage', ...toGrade(normalizeScore(overview.hotspotFiles, true, Math.max(overview.totalFiles, 1) * 0.2)), score: normalizeScore(overview.hotspotFiles, true, Math.max(overview.totalFiles, 1) * 0.2) },
    ];

    const overall = Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length);
    const overallGrade = toGrade(overall);

    if (opts.json) {
      console.log(JSON.stringify({ dimensions: dimensions.map((d) => ({ name: d.name, score: d.score, grade: d.grade })), overall: { score: overall, grade: overallGrade.grade } }, null, 2));
      return;
    }

    console.log(pc.bold('  Dimension Grades\n'));
    for (const d of dimensions) {
      const bar = d.color('█'.repeat(Math.round(d.score / 5))) + pc.dim('░'.repeat(20 - Math.round(d.score / 5)));
      console.log(`  ${d.name.padEnd(20)} ${bar} ${d.color(pc.bold(d.grade))} (${d.score})`);
    }

    console.log();
    console.log(`  ${pc.bold('Overall:')}            ${overallGrade.color(pc.bold(overallGrade.grade))} (${overall}/100)`);
    console.log();
  });
