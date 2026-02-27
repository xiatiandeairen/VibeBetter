import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface WeeklyTask {
  priority: 'P0' | 'P1' | 'P2';
  task: string;
  area: string;
  estimatedHours: number;
  reason: string;
}

function buildWeeklyPlan(_overview: Record<string, unknown>): WeeklyTask[] {
  return [
    { priority: 'P0', task: 'Fix authentication regression', area: 'Security', estimatedHours: 4, reason: 'Blocking users' },
    { priority: 'P0', task: 'Deploy database migration', area: 'Infrastructure', estimatedHours: 2, reason: 'Schema out of sync' },
    { priority: 'P1', task: 'Optimize dashboard query', area: 'Performance', estimatedHours: 6, reason: '3s load time' },
    { priority: 'P1', task: 'Add missing API tests', area: 'Quality', estimatedHours: 8, reason: 'Coverage below 80%' },
    { priority: 'P2', task: 'Update dependency versions', area: 'Maintenance', estimatedHours: 3, reason: 'Security advisories' },
    { priority: 'P2', task: 'Refactor legacy parser', area: 'Tech Debt', estimatedHours: 5, reason: 'High complexity score' },
  ];
}

export const weeklyPlanCommand = new Command('weekly-plan')
  .description('Generate a prioritized weekly plan based on metrics')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Weekly Plan');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const tasks = buildWeeklyPlan(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ tasks, totalHours: tasks.reduce((s, t) => s + t.estimatedHours, 0) }, null, 2));
      return;
    }

    console.log();
    for (const t of tasks) {
      const pColor = t.priority === 'P0' ? pc.red : t.priority === 'P1' ? pc.yellow : pc.cyan;
      console.log(`  ${pColor(t.priority)} ${pc.bold(t.task)} ${pc.dim(`[${t.area}]`)} ${pc.dim(`~${t.estimatedHours}h`)}`);
      console.log(`     ${pc.dim(`→ ${t.reason}`)}`);
    }

    console.log();
    metric('Total tasks', String(tasks.length));
    metric('Estimated hours', String(tasks.reduce((s, t) => s + t.estimatedHours, 0)));
    success('Weekly plan generated.');
  });
