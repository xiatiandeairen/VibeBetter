import { Command } from 'commander';
import pc from 'picocolors';
import { header, info } from '../utils/display.js';

type Priority = 'critical' | 'high' | 'medium' | 'low';

interface RoadmapItem {
  id: string;
  title: string;
  priority: Priority;
  effort: 'small' | 'medium' | 'large';
  category: string;
  reason: string;
}

function generateRoadmap(): RoadmapItem[] {
  return [
    { id: 'R-001', title: 'Reduce PSRI in shared package', priority: 'critical', effort: 'large', category: 'Risk', reason: 'PSRI trending upward 3 weeks' },
    { id: 'R-002', title: 'Add tests for CLI commands', priority: 'high', effort: 'medium', category: 'Quality', reason: 'Coverage below 60%' },
    { id: 'R-003', title: 'Refactor hotspot files', priority: 'high', effort: 'large', category: 'Tech Debt', reason: '5 files exceed complexity threshold' },
    { id: 'R-004', title: 'Improve AI success rate', priority: 'medium', effort: 'medium', category: 'AI', reason: 'AI success rate plateaued at 78%' },
    { id: 'R-005', title: 'Update dependencies', priority: 'medium', effort: 'small', category: 'Maintenance', reason: '12 outdated packages' },
    { id: 'R-006', title: 'Add E2E tests for dashboard', priority: 'low', effort: 'large', category: 'Quality', reason: 'No E2E coverage for web app' },
  ];
}

function priorityIcon(p: Priority): string {
  switch (p) {
    case 'critical': return pc.red('🔴');
    case 'high': return pc.yellow('🟡');
    case 'medium': return pc.blue('🔵');
    case 'low': return pc.dim('⚪');
  }
}

export const roadmapCommand = new Command('roadmap')
  .description('Show project roadmap based on risk priorities')
  .option('--priority <level>', 'Filter by minimum priority (critical, high, medium, low)')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Project Roadmap');

    let items = generateRoadmap();

    if (opts.priority) {
      const levels: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
      const min = levels[opts.priority] ?? 1;
      items = items.filter(i => (levels[i.priority] ?? 0) >= min);
    }

    if (opts.json) {
      console.log(JSON.stringify(items, null, 2));
      return;
    }

    console.log();
    for (const item of items) {
      console.log(
        `  ${priorityIcon(item.priority)} ${pc.bold(item.id)} ${item.title}` +
        `  ${pc.dim(`[${item.category}]`)}  effort: ${pc.dim(item.effort)}`,
      );
      console.log(`    ${pc.dim(item.reason)}`);
    }

    console.log();
    info(`${items.length} roadmap items prioritized by risk.`);
  });
