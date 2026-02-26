import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

function bar(value: number, max: number, width = 20): string {
  const filled = Math.round((value / (max || 1)) * width);
  return pc.cyan('█'.repeat(filled)) + pc.dim('░'.repeat(width - filled));
}

export const compareToolsCommand = new Command('compare-tools')
  .description('Compare effectiveness across AI tools')
  .action(async () => {
    header('AI Tool Comparison');
    const config = requireConfig();
    const client = new ApiClient(config);

    const aiStats = await client.getAiStats().catch(() => null);
    if (!aiStats || Object.keys(aiStats.toolUsage).length === 0) {
      info('No AI tool usage data available. Run: vibe sync');
      return;
    }

    const tools = Object.entries(aiStats.toolUsage).sort(([, a], [, b]) => b - a);
    const maxUsage = tools[0]?.[1] ?? 1;
    const totalUsage = tools.reduce((sum, [, count]) => sum + count, 0);

    console.log(pc.bold('  AI Tool Usage Comparison\n'));
    console.log(`  ${'Tool'.padEnd(16)} ${'Usage'.padEnd(8)} ${'Share'.padEnd(8)} Graph`);
    console.log(pc.dim(`  ${'─'.repeat(16)} ${'─'.repeat(8)} ${'─'.repeat(8)} ${'─'.repeat(20)}`));

    for (const [tool, count] of tools) {
      const share = totalUsage > 0 ? ((count / totalUsage) * 100).toFixed(1) : '0.0';
      console.log(`  ${pc.bold(tool.padEnd(16))} ${String(count).padEnd(8)} ${(share + '%').padEnd(8)} ${bar(count, maxUsage)}`);
    }

    console.log();
    console.log(pc.dim(`  Total events: ${totalUsage}`));
    console.log(pc.dim(`  Acceptance rate: ${(aiStats.acceptanceRate * 100).toFixed(1)}%`));
    console.log(pc.dim(`  Avg edit distance: ${aiStats.avgEditDistance.toFixed(1)}`));
    console.log();
  });
