import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

function pctBar(value: number, width = 20): string {
  const filled = Math.round(value * width);
  return pc.green('█'.repeat(filled)) + pc.dim('░'.repeat(width - filled));
}

export const profileCommand = new Command('profile')
  .description('Show developer personal AI coding stats')
  .option('--user <id>', 'User ID (defaults to current)')
  .action(async (opts) => {
    header('Developer Profile');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    const aiRate = overview.aiSuccessRate ?? 0;
    const totalPrs = overview.totalPrs ?? 0;
    const aiPrs = overview.aiPrs ?? 0;
    const humanPrs = totalPrs - aiPrs;

    console.log(pc.bold('  Profile Summary'));
    if (opts.user) console.log(`  ${pc.dim('User:')}         ${opts.user}`);
    console.log();
    console.log(`  ${pc.dim('Total PRs:')}     ${totalPrs}`);
    console.log(`  ${pc.dim('AI PRs:')}        ${aiPrs}`);
    console.log(`  ${pc.dim('Human PRs:')}     ${humanPrs}`);
    console.log(`  ${pc.dim('AI Usage:')}      ${totalPrs > 0 ? ((aiPrs / totalPrs) * 100).toFixed(1) : '0.0'}%`);
    console.log();
    console.log(`  ${pc.dim('AI Success:')}    ${pctBar(aiRate)} ${(aiRate * 100).toFixed(1)}%`);
    console.log();

    const grade = aiRate >= 0.9 ? 'A' : aiRate >= 0.8 ? 'B' : aiRate >= 0.7 ? 'C' : aiRate >= 0.6 ? 'D' : 'F';
    const gradeColor = grade === 'A' ? pc.green : grade === 'B' ? pc.cyan : grade === 'C' ? pc.yellow : pc.red;
    console.log(`  ${pc.dim('Overall Grade:')} ${gradeColor(pc.bold(grade))}`);
    console.log();
  });
