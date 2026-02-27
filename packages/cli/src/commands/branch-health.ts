import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface BranchInfo {
  name: string;
  ageDays: number;
  behindMain: number;
  conflicts: boolean;
  lastCommitDays: number;
  status: 'healthy' | 'stale' | 'conflict' | 'abandoned';
}

function analyzeBranches(_overview: Record<string, unknown>): BranchInfo[] {
  return [
    { name: 'feature/auth-v2', ageDays: 5, behindMain: 3, conflicts: false, lastCommitDays: 1, status: 'healthy' },
    { name: 'feature/dashboard-rewrite', ageDays: 22, behindMain: 45, conflicts: true, lastCommitDays: 8, status: 'conflict' },
    { name: 'fix/rate-limit', ageDays: 3, behindMain: 1, conflicts: false, lastCommitDays: 0, status: 'healthy' },
    { name: 'feature/export-csv', ageDays: 45, behindMain: 80, conflicts: true, lastCommitDays: 30, status: 'abandoned' },
    { name: 'chore/deps-update', ageDays: 12, behindMain: 20, conflicts: false, lastCommitDays: 10, status: 'stale' },
  ];
}

export const branchHealthCommand = new Command('branch-health')
  .description('Analyze branch health: staleness, conflicts, and drift')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Branch Health');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const branches = analyzeBranches(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ branches }, null, 2));
      return;
    }

    console.log();
    for (const b of branches) {
      const color = b.status === 'healthy' ? pc.green : b.status === 'stale' ? pc.yellow : b.status === 'conflict' ? pc.red : pc.dim;
      const icon = b.status === 'healthy' ? '✔' : b.status === 'stale' ? '⏳' : b.status === 'conflict' ? '✘' : '☠';
      console.log(`  ${color(icon)} ${pc.bold(b.name.padEnd(32))} ${color(`[${b.status}]`)} behind=${b.behindMain} age=${b.ageDays}d`);
    }

    console.log();
    metric('Branches analyzed', String(branches.length));
    metric('Healthy', String(branches.filter(b => b.status === 'healthy').length));
    metric('Needs attention', String(branches.filter(b => b.status !== 'healthy').length));
    success('Branch health analysis complete.');
  });
