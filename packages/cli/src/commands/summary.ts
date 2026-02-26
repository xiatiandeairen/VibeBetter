import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, percentStr, benchmarkColor, info, success, warn } from '../utils/display.js';

export const summaryCommand = new Command('summary')
  .description('Combined check + insights + risk summary in one output')
  .action(async () => {
    header('Project Summary');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    console.log(pc.bold('  Metrics Overview\n'));
    metric('AI Success Rate', percentStr(overview.aiSuccessRate), benchmarkColor('aiSuccessRate', overview.aiSuccessRate ?? 0));
    metric('AI Stable Rate', percentStr(overview.aiStableRate), benchmarkColor('aiSuccessRate', overview.aiStableRate ?? 0));
    metric('PSRI Score', overview.psriScore?.toFixed(3) ?? 'N/A', benchmarkColor('psriScore', overview.psriScore ?? 0));
    metric('TDI Score', overview.tdiScore?.toFixed(3) ?? 'N/A', benchmarkColor('tdiScore', overview.tdiScore ?? 0));
    metric('Total PRs', String(overview.totalPrs));
    metric('AI PRs', String(overview.aiPrs));
    metric('Hotspot Files', `${overview.hotspotFiles}/${overview.totalFiles}`);
    console.log();

    const aiStats = await client.getAiStats().catch(() => null);
    if (aiStats) {
      console.log(pc.bold('  AI Insights\n'));
      metric('Generations', String(aiStats.totalGenerations));
      metric('Accepted', String(aiStats.totalAccepted));
      metric('Acceptance Rate', percentStr(aiStats.acceptanceRate), benchmarkColor('aiSuccessRate', aiStats.acceptanceRate));
      metric('Avg Edit Distance', aiStats.avgEditDistance.toFixed(1));
      console.log();
    }

    console.log(pc.bold('  Risk Assessment\n'));
    const psri = overview.psriScore ?? 0;
    if (psri <= 0.3) success('Low structural risk — project is healthy');
    else if (psri <= 0.6) warn('Moderate risk — review hotspots');
    else warn('High risk — immediate attention recommended');

    const tdi = overview.tdiScore ?? 0;
    if (tdi <= 0.3) success('Technical debt is manageable');
    else if (tdi <= 0.6) warn('Technical debt accumulating');
    else warn('Critical technical debt levels');
    console.log();
  });
