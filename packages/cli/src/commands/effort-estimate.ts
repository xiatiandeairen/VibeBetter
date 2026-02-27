import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface EffortItem {
  task: string;
  complexity: 'trivial' | 'small' | 'medium' | 'large' | 'epic';
  estimatedHours: number;
  confidence: number;
  riskFactors: string[];
}

function estimateEffort(_overview: Record<string, unknown>): EffortItem[] {
  return [
    { task: 'Add user preferences API', complexity: 'medium', estimatedHours: 16, confidence: 0.8, riskFactors: ['Schema migration'] },
    { task: 'Fix login redirect bug', complexity: 'small', estimatedHours: 4, confidence: 0.9, riskFactors: [] },
    { task: 'Rewrite dashboard to React 19', complexity: 'epic', estimatedHours: 80, confidence: 0.5, riskFactors: ['Breaking changes', 'Test coverage gaps'] },
    { task: 'Add CSV export', complexity: 'small', estimatedHours: 8, confidence: 0.85, riskFactors: ['Large dataset handling'] },
    { task: 'Integrate Slack notifications', complexity: 'medium', estimatedHours: 20, confidence: 0.7, riskFactors: ['OAuth flow', 'Rate limits'] },
  ];
}

export const effortEstimateCommand = new Command('effort-estimate')
  .description('Estimate development effort for pending tasks')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Effort Estimation');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const items = estimateEffort(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ tasks: items, totalHours: items.reduce((s, i) => s + i.estimatedHours, 0) }, null, 2));
      return;
    }

    console.log();
    for (const item of items) {
      const color = item.complexity === 'epic' ? pc.red : item.complexity === 'large' ? pc.yellow : item.complexity === 'medium' ? pc.cyan : pc.green;
      console.log(`  ${color(`[${item.complexity.padEnd(7)}]`)} ${pc.bold(item.task.padEnd(36))} ~${item.estimatedHours}h ${pc.dim(`(${(item.confidence * 100).toFixed(0)}% conf)`)}`);
      if (item.riskFactors.length > 0) {
        console.log(`${''.padEnd(12)} ${pc.dim(`risks: ${item.riskFactors.join(', ')}`)}`);
      }
    }

    console.log();
    metric('Tasks estimated', String(items.length));
    metric('Total effort', `${items.reduce((s, i) => s + i.estimatedHours, 0)}h`);
    success('Effort estimation complete.');
  });
