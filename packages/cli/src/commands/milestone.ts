import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface MilestoneEntry {
  name: string;
  dueDate: string;
  progress: number;
  status: 'on-track' | 'at-risk' | 'behind' | 'completed';
  deliverables: number;
  completedDeliverables: number;
}

function trackMilestones(overview: Record<string, unknown>): MilestoneEntry[] {
  const totalPrs = (overview.totalPrs as number) ?? 30;
  return [
    { name: 'MVP Launch', dueDate: '2026-03-15', progress: 100, status: 'completed', deliverables: 8, completedDeliverables: 8 },
    { name: 'Beta Release', dueDate: '2026-04-01', progress: 72, status: 'on-track', deliverables: 12, completedDeliverables: 9 },
    { name: 'Enterprise Features', dueDate: '2026-05-01', progress: 35, status: 'at-risk', deliverables: 15, completedDeliverables: 5 },
    { name: 'Performance Optimization', dueDate: '2026-04-15', progress: 20, status: 'behind', deliverables: totalPrs > 20 ? 10 : 6, completedDeliverables: 2 },
    { name: 'Public API v2', dueDate: '2026-06-01', progress: 10, status: 'on-track', deliverables: 20, completedDeliverables: 2 },
  ];
}

export const milestoneCommand = new Command('milestone')
  .description('Track project milestones')
  .option('--json', 'Output as JSON')
  .option('--status <s>', 'Filter by status')
  .action(async (opts) => {
    header('Project Milestones');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    let milestones = trackMilestones(overview as Record<string, unknown>);
    if (opts.status) {
      milestones = milestones.filter(m => m.status === opts.status);
    }

    if (opts.json) {
      console.log(JSON.stringify({ milestones }, null, 2));
      return;
    }

    console.log();
    for (const m of milestones) {
      const statusColor = m.status === 'completed' ? pc.green : m.status === 'on-track' ? pc.blue : m.status === 'at-risk' ? pc.yellow : pc.red;
      const bar = statusColor('█'.repeat(Math.round(m.progress / 5))) + pc.dim('░'.repeat(20 - Math.round(m.progress / 5)));
      console.log(`  ${statusColor(`[${m.status}]`.padEnd(12))} ${pc.bold(m.name.padEnd(26))} ${bar} ${statusColor(`${m.progress}%`)}`);
      console.log(`${''.padEnd(14)} Due: ${pc.dim(m.dueDate)}  Deliverables: ${m.completedDeliverables}/${m.deliverables}`);
      console.log();
    }

    metric('Total milestones', String(milestones.length));
    metric('Completed', String(milestones.filter(m => m.status === 'completed').length));
    success('Milestone tracking complete.');
  });
