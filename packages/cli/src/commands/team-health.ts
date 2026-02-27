import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface HealthDimension {
  name: string;
  score: number;
  weight: number;
}

function computeTeamHealth(overview: Record<string, unknown>): { score: number; dimensions: HealthDimension[] } {
  const dimensions: HealthDimension[] = [
    { name: 'Code Quality', score: Math.min(100, ((overview.avgComplexity as number) ?? 50) > 30 ? 60 : 90), weight: 0.25 },
    { name: 'AI Effectiveness', score: Math.round(((overview.aiSuccessRate as number) ?? 70)), weight: 0.20 },
    { name: 'Velocity', score: Math.min(100, ((overview.totalPrs as number) ?? 10) * 5), weight: 0.20 },
    { name: 'Risk Management', score: Math.max(0, 100 - ((overview.psriScore as number) ?? 40)), weight: 0.20 },
    { name: 'Test Coverage', score: Math.round(((overview.coveragePercent as number) ?? 65)), weight: 0.15 },
  ];

  const score = Math.round(dimensions.reduce((sum, d) => sum + d.score * d.weight, 0));
  return { score, dimensions };
}

export const teamHealthCommand = new Command('team-health')
  .description('Aggregate team health score across multiple dimensions')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Team Health Score');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const { score, dimensions } = computeTeamHealth(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ score, dimensions }, null, 2));
      return;
    }

    console.log();
    const color = score >= 80 ? pc.green : score >= 60 ? pc.yellow : pc.red;
    console.log(`  ${pc.bold('Overall Team Health:')} ${color(pc.bold(String(score)))} / 100`);
    console.log();

    for (const dim of dimensions) {
      const bar = '█'.repeat(Math.round(dim.score / 5));
      const dimColor = dim.score >= 80 ? pc.green : dim.score >= 60 ? pc.yellow : pc.red;
      console.log(`  ${dim.name.padEnd(20)} ${dimColor(bar)} ${dim.score}`);
    }

    console.log();
    metric('Dimensions evaluated', String(dimensions.length));
    success('Team health assessment complete.');
  });
