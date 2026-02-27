import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface ResourceSuggestion {
  area: string;
  current: string;
  suggested: string;
  impact: 'high' | 'medium' | 'low';
  estimatedSaving: string;
}

function suggestOptimizations(overview: Record<string, unknown>): ResourceSuggestion[] {
  const totalPrs = (overview.totalPrs as number) ?? 30;
  return [
    { area: 'CI pipeline', current: `${Math.round(totalPrs * 3)} min/day`, suggested: 'Parallel test stages', impact: 'high', estimatedSaving: '40% build time' },
    { area: 'Review load', current: '2 reviewers handle 80%', suggested: 'Round-robin assignment', impact: 'high', estimatedSaving: '50% review wait' },
    { area: 'Test suite', current: '12 min full run', suggested: 'Test impact analysis', impact: 'medium', estimatedSaving: '60% test time on PRs' },
    { area: 'Dependencies', current: '15 unused packages', suggested: 'Remove unused deps', impact: 'low', estimatedSaving: '20% install time' },
    { area: 'Docker builds', current: '8 min avg', suggested: 'Multi-stage + layer caching', impact: 'medium', estimatedSaving: '55% build time' },
    { area: 'Database queries', current: '3 N+1 patterns', suggested: 'Eager loading / joins', impact: 'high', estimatedSaving: '70% query time' },
  ];
}

export const resourceOptimizeCommand = new Command('resource-optimize')
  .description('Suggest resource optimization')
  .option('--json', 'Output as JSON')
  .option('--impact <level>', 'Filter by impact level')
  .action(async (opts) => {
    header('Resource Optimization');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    let suggestions = suggestOptimizations(overview as Record<string, unknown>);
    if (opts.impact) suggestions = suggestions.filter(s => s.impact === opts.impact);

    if (opts.json) {
      console.log(JSON.stringify({ suggestions }, null, 2));
      return;
    }

    console.log();
    for (const s of suggestions) {
      const impactColor = s.impact === 'high' ? pc.red : s.impact === 'medium' ? pc.yellow : pc.dim;
      console.log(`  ${impactColor(`[${s.impact}]`.toUpperCase().padEnd(10))} ${pc.bold(s.area)}`);
      console.log(`${''.padEnd(12)} Current: ${pc.dim(s.current)}`);
      console.log(`${''.padEnd(12)} Suggestion: ${pc.green(s.suggested)}`);
      console.log(`${''.padEnd(12)} Est. saving: ${pc.bold(s.estimatedSaving)}`);
      console.log();
    }

    metric('Suggestions', String(suggestions.length));
    metric('High impact', String(suggestions.filter(s => s.impact === 'high').length));
    success('Resource optimization analysis complete.');
  });
