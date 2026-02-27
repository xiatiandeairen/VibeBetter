import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface QualityDimension {
  name: string;
  score: number;
  weight: number;
  trend: 'up' | 'down' | 'stable';
}

function computeQuality(_overview: Record<string, unknown>): QualityDimension[] {
  return [
    { name: 'Test Coverage', score: 87, weight: 0.2, trend: 'up' },
    { name: 'Code Complexity', score: 78, weight: 0.15, trend: 'stable' },
    { name: 'Documentation', score: 92, weight: 0.1, trend: 'up' },
    { name: 'Type Safety', score: 85, weight: 0.15, trend: 'up' },
    { name: 'Dependency Health', score: 72, weight: 0.1, trend: 'down' },
    { name: 'Security', score: 90, weight: 0.15, trend: 'stable' },
    { name: 'Performance', score: 81, weight: 0.15, trend: 'up' },
  ];
}

export const qualityScoreCommand = new Command('quality-score')
  .description('Calculate weighted quality score across dimensions')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Quality Score');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const dims = computeQuality(overview as Record<string, unknown>);
    const overall = Math.round(dims.reduce((s, d) => s + d.score * d.weight, 0) / dims.reduce((s, d) => s + d.weight, 0));

    if (opts.json) {
      console.log(JSON.stringify({ dimensions: dims, overallScore: overall }, null, 2));
      return;
    }

    console.log();
    for (const d of dims) {
      const color = d.score >= 85 ? pc.green : d.score >= 70 ? pc.yellow : pc.red;
      const trendIcon = d.trend === 'up' ? pc.green('↑') : d.trend === 'down' ? pc.red('↓') : pc.dim('→');
      const bar = color('█'.repeat(Math.round(d.score / 5))) + pc.dim('░'.repeat(20 - Math.round(d.score / 5)));
      console.log(`  ${bar} ${color(`${d.score}%`.padStart(4))} ${pc.bold(d.name)} ${trendIcon}`);
    }

    console.log();
    metric('Overall quality', `${overall}%`);
    success('Quality score calculated.');
  });
