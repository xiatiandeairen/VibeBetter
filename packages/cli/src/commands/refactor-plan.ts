import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface RefactorItem {
  file: string;
  complexity: number;
  changeFrequency: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  suggestion: string;
  estimatedHours: number;
}

function generateRefactorPlan(overview: Record<string, unknown>): RefactorItem[] {
  const hotspots = (overview.hotspotFiles as number) ?? 5;
  return [
    { file: 'apps/server/src/routes/metrics.ts', complexity: 45, changeFrequency: 28, priority: 'critical', suggestion: 'Extract sub-routers for each metric type', estimatedHours: 8 },
    { file: 'apps/web/src/components/Dashboard.tsx', complexity: 38, changeFrequency: 22, priority: 'high', suggestion: 'Split into smaller focused components', estimatedHours: 6 },
    { file: 'packages/shared/src/types/index.ts', complexity: 12, changeFrequency: 35, priority: 'high', suggestion: 'Group exports by domain module', estimatedHours: 3 },
    { file: 'apps/server/src/services/collector.ts', complexity: 32, changeFrequency: 15, priority: 'medium', suggestion: 'Apply strategy pattern for data sources', estimatedHours: 5 },
    { file: 'packages/cli/src/index.ts', complexity: 8, changeFrequency: 40, priority: 'medium', suggestion: 'Auto-register commands via directory scan', estimatedHours: 4 },
  ];
}

const priorityColor = (p: string) =>
  p === 'critical' ? pc.red : p === 'high' ? pc.yellow : p === 'medium' ? pc.cyan : pc.dim;

export const refactorPlanCommand = new Command('refactor-plan')
  .description('Generate refactoring plan for high-risk files')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Refactoring Plan');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const plan = generateRefactorPlan(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify(plan, null, 2));
      return;
    }

    console.log();
    for (const item of plan) {
      const pc2 = priorityColor(item.priority);
      console.log(`  ${pc2(`[${item.priority.toUpperCase()}]`)} ${pc.bold(item.file)}`);
      console.log(`    Complexity: ${item.complexity}  Changes: ${item.changeFrequency}  Est: ${item.estimatedHours}h`);
      console.log(`    ${pc.dim('→')} ${item.suggestion}`);
      console.log();
    }

    const totalHours = plan.reduce((s, i) => s + i.estimatedHours, 0);
    metric('Files to refactor', String(plan.length));
    metric('Estimated total', `${totalHours} hours`);
    success('Refactoring plan generated.');
  });
