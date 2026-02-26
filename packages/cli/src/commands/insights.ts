import { Command } from 'commander';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, percentStr, benchmarkColor } from '../utils/display.js';
import { showTip } from '../utils/tips.js';
import pc from 'picocolors';

export const insightsCommand = new Command('insights')
  .description('Show AI coding effectiveness summary')
  .action(async () => {
    header('AI Coding Insights');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview();
    const aiStats = await client.getAiStats().catch(() => null);

    console.log(pc.bold('  Effectiveness'));
    metric('AI Success Rate', percentStr(overview.aiSuccessRate), benchmarkColor('aiSuccessRate', overview.aiSuccessRate ?? 0));
    metric('AI Stable Rate', percentStr(overview.aiStableRate), benchmarkColor('aiStableRate', overview.aiStableRate ?? 0));
    metric('Total PRs', overview.totalPrs);
    metric('AI PRs', overview.aiPrs);

    if (aiStats) {
      console.log();
      console.log(pc.bold('  Tool Usage'));
      metric('Acceptance Rate', percentStr(aiStats.acceptanceRate), benchmarkColor('aiSuccessRate', aiStats.acceptanceRate));
      metric('Avg Edit Distance', aiStats.avgEditDistance.toFixed(2));
      metric('Total Generations', aiStats.totalGenerations);

      if (Object.keys(aiStats.toolUsage).length > 0) {
        console.log();
        console.log(pc.bold('  Tools'));
        for (const [tool, count] of Object.entries(aiStats.toolUsage)) {
          metric(tool, `${count} events`);
        }
      }
    }

    showTip();
  });
