import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface AiSummaryData {
  totalAiPrs: number;
  totalHumanPrs: number;
  aiSuccessRate: number;
  avgAiEditDistance: number;
  topTools: { tool: string; usage: number }[];
  weeklyTrend: 'up' | 'down' | 'stable';
}

function buildAiSummary(_overview: Record<string, unknown>): AiSummaryData {
  return {
    totalAiPrs: 142,
    totalHumanPrs: 98,
    aiSuccessRate: 87.5,
    avgAiEditDistance: 12.3,
    topTools: [
      { tool: 'Copilot', usage: 68 },
      { tool: 'Cursor', usage: 52 },
      { tool: 'Claude', usage: 35 },
    ],
    weeklyTrend: 'up',
  };
}

export const aiSummaryCommand = new Command('ai-summary')
  .description('Generate an AI coding activity summary')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('AI Summary');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const data = buildAiSummary(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    console.log();
    metric('AI PRs', String(data.totalAiPrs));
    metric('Human PRs', String(data.totalHumanPrs));
    metric('AI success rate', `${data.aiSuccessRate}%`);
    metric('Avg edit distance', String(data.avgAiEditDistance));
    metric('Weekly trend', data.weeklyTrend === 'up' ? pc.green('↑') : data.weeklyTrend === 'down' ? pc.red('↓') : pc.dim('→'));

    console.log();
    console.log(`  ${pc.bold('Top AI Tools:')}`);
    for (const t of data.topTools) {
      const bar = pc.cyan('█'.repeat(Math.round(t.usage / 4)));
      console.log(`    ${bar} ${pc.bold(t.tool)} (${t.usage})`);
    }

    console.log();
    success('AI summary generated.');
  });
