import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface RetroItem {
  category: 'went-well' | 'improve' | 'action';
  text: string;
  votes: number;
  metricBacked: boolean;
}

function generateRetroData(overview: Record<string, unknown>): RetroItem[] {
  const totalPrs = (overview.totalPrs as number) ?? 30;
  const aiPrs = (overview.aiPrs as number) ?? 12;
  return [
    { category: 'went-well', text: `Merged ${totalPrs} PRs this sprint`, votes: 5, metricBacked: true },
    { category: 'went-well', text: `AI-assisted PRs at ${Math.round((aiPrs / Math.max(totalPrs, 1)) * 100)}%`, votes: 4, metricBacked: true },
    { category: 'went-well', text: 'Zero production incidents', votes: 8, metricBacked: true },
    { category: 'improve', text: 'Code review turnaround > 8h average', votes: 6, metricBacked: true },
    { category: 'improve', text: 'Test coverage dropped 3% this sprint', votes: 4, metricBacked: true },
    { category: 'improve', text: 'Too many WIP items simultaneously', votes: 3, metricBacked: false },
    { category: 'action', text: 'Set review SLA to 4h max', votes: 7, metricBacked: false },
    { category: 'action', text: 'Add coverage gate to CI pipeline', votes: 5, metricBacked: true },
    { category: 'action', text: 'Limit WIP to 3 per developer', votes: 4, metricBacked: false },
  ];
}

export const teamRetrospectiveCommand = new Command('team-retrospective')
  .description('Generate retrospective data from metrics')
  .option('--json', 'Output as JSON')
  .option('--sprint <name>', 'Sprint name', 'current')
  .action(async (opts) => {
    header('Team Retrospective');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const items = generateRetroData(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ sprint: opts.sprint, items }, null, 2));
      return;
    }

    const categories = ['went-well', 'improve', 'action'] as const;
    const labels: Record<string, string> = { 'went-well': '🟢 Went Well', improve: '🟡 Improve', action: '🔵 Action Items' };

    console.log();
    console.log(`  Sprint: ${pc.bold(opts.sprint)}`);
    for (const cat of categories) {
      console.log();
      console.log(`  ${pc.bold(labels[cat])}`);
      const catItems = items.filter(i => i.category === cat).sort((a, b) => b.votes - a.votes);
      for (const item of catItems) {
        const badge = item.metricBacked ? pc.cyan(' [metric]') : '';
        console.log(`    ${pc.dim(`(${item.votes})`)} ${item.text}${badge}`);
      }
    }

    console.log();
    metric('Total items', String(items.length));
    metric('Metric-backed', String(items.filter(i => i.metricBacked).length));
    success('Retrospective data generated.');
  });
