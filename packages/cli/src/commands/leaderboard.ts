import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

interface LeaderEntry {
  rank: number;
  name: string;
  aiSuccessRate: number;
  totalPrs: number;
  aiPrs: number;
}

function medal(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `  ${rank}`;
}

export const leaderboardCommand = new Command('leaderboard')
  .description('Team leaderboard by AI effectiveness')
  .option('--limit <n>', 'Max entries to show', '10')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Team Leaderboard');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    const entries: LeaderEntry[] = [
      { rank: 1, name: 'Team Alpha', aiSuccessRate: overview.aiSuccessRate ?? 0, totalPrs: overview.totalPrs, aiPrs: overview.aiPrs ?? 0 },
    ];

    const limit = parseInt(opts.limit, 10);

    if (opts.json) {
      console.log(JSON.stringify(entries.slice(0, limit), null, 2));
      return;
    }

    console.log(pc.bold('  AI Effectiveness Leaderboard\n'));
    console.log(`  ${pc.dim('#'.padEnd(4))} ${'Name'.padEnd(20)} ${'AI Rate'.padEnd(10)} ${'PRs'.padEnd(8)} ${'AI PRs'}`);
    console.log(`  ${pc.dim('─'.repeat(56))}`);

    for (const entry of entries.slice(0, limit)) {
      const rate = (entry.aiSuccessRate * 100).toFixed(1) + '%';
      const rateColor = entry.aiSuccessRate >= 0.85 ? pc.green : entry.aiSuccessRate >= 0.7 ? pc.yellow : pc.red;
      console.log(
        `  ${medal(entry.rank).padEnd(4)} ${entry.name.padEnd(20)} ${rateColor(rate.padEnd(10))} ${String(entry.totalPrs).padEnd(8)} ${entry.aiPrs}`,
      );
    }

    console.log();
  });
