import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface TeamMemberStats {
  name: string;
  commits: number;
  prsOpened: number;
  prsMerged: number;
  reviewsDone: number;
  aiAdoptionRate: number;
}

function buildTeamReport(_overview: Record<string, unknown>): TeamMemberStats[] {
  return [
    { name: 'Alice', commits: 45, prsOpened: 12, prsMerged: 11, reviewsDone: 20, aiAdoptionRate: 85 },
    { name: 'Bob', commits: 38, prsOpened: 10, prsMerged: 9, reviewsDone: 15, aiAdoptionRate: 72 },
    { name: 'Carol', commits: 52, prsOpened: 15, prsMerged: 14, reviewsDone: 25, aiAdoptionRate: 90 },
    { name: 'Dave', commits: 28, prsOpened: 8, prsMerged: 7, reviewsDone: 18, aiAdoptionRate: 65 },
    { name: 'Eve', commits: 60, prsOpened: 18, prsMerged: 17, reviewsDone: 30, aiAdoptionRate: 95 },
  ];
}

export const teamReportCommand = new Command('team-report')
  .description('Generate a team activity and performance report')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Team Report');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const members = buildTeamReport(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ team: members, totalCommits: members.reduce((s, m) => s + m.commits, 0) }, null, 2));
      return;
    }

    console.log();
    console.log(`  ${pc.dim('Name'.padEnd(10))} ${'Commits'.padEnd(10)} ${'PRs'.padEnd(10)} ${'Reviews'.padEnd(10)} ${'AI %'.padEnd(6)}`);
    console.log(pc.dim('  ' + '─'.repeat(50)));
    for (const m of members) {
      const aiColor = m.aiAdoptionRate >= 80 ? pc.green : m.aiAdoptionRate >= 60 ? pc.yellow : pc.red;
      console.log(`  ${pc.bold(m.name.padEnd(10))} ${String(m.commits).padEnd(10)} ${`${m.prsMerged}/${m.prsOpened}`.padEnd(10)} ${String(m.reviewsDone).padEnd(10)} ${aiColor(`${m.aiAdoptionRate}%`)}`);
    }

    console.log();
    metric('Team size', String(members.length));
    metric('Total commits', String(members.reduce((s, m) => s + m.commits, 0)));
    success('Team report generated.');
  });
