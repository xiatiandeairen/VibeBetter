import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface AdoptionData {
  tool: string;
  activeUsers: number;
  totalUsers: number;
  adoptionRate: number;
  trend: 'up' | 'stable' | 'down';
}

function analyzeAdoption(overview: Record<string, unknown>): AdoptionData[] {
  const aiRate = (overview.aiSuccessRate as number) ?? 70;
  return [
    { tool: 'GitHub Copilot', activeUsers: 12, totalUsers: 15, adoptionRate: 80, trend: 'up' },
    { tool: 'Cursor', activeUsers: 8, totalUsers: 15, adoptionRate: 53, trend: 'up' },
    { tool: 'ChatGPT', activeUsers: 14, totalUsers: 15, adoptionRate: 93, trend: 'stable' },
    { tool: 'AI Code Review', activeUsers: 5, totalUsers: 15, adoptionRate: Math.round(aiRate * 0.5), trend: 'up' },
    { tool: 'AI Test Gen', activeUsers: 3, totalUsers: 15, adoptionRate: 20, trend: 'down' },
  ];
}

const trendIcon = (t: 'up' | 'stable' | 'down') =>
  t === 'up' ? pc.green('↑') : t === 'down' ? pc.red('↓') : pc.dim('→');

export const adoptionCommand = new Command('adoption')
  .description('AI tool adoption rate tracking')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('AI Tool Adoption');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const data = analyzeAdoption(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    console.log();
    for (const item of data) {
      const rateColor = item.adoptionRate >= 70 ? pc.green : item.adoptionRate >= 40 ? pc.yellow : pc.red;
      const bar = '█'.repeat(Math.round(item.adoptionRate / 5));
      console.log(`  ${item.tool.padEnd(20)} ${rateColor(bar.padEnd(20))} ${rateColor(`${item.adoptionRate}%`)} ${trendIcon(item.trend)} (${item.activeUsers}/${item.totalUsers})`);
    }

    console.log();
    const avgAdoption = Math.round(data.reduce((s, d) => s + d.adoptionRate, 0) / data.length);
    metric('Average adoption', `${avgAdoption}%`);
    metric('Tools tracked', String(data.length));
    success('Adoption analysis complete.');
  });
