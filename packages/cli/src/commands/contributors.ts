import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

interface ContributorStat {
  author: string;
  commits: number;
  filesChanged: number;
  aiAssistedCommits: number;
  aiUsagePercent: number;
  avgRiskContribution: number;
}

function usageBar(percent: number, width: number = 15): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return pc.cyan('█'.repeat(filled)) + pc.dim('░'.repeat(empty));
}

export const contributorsCommand = new Command('contributors')
  .description('Show contributor statistics and AI usage per author')
  .option('--sort <field>', 'Sort by: commits, ai, risk, name', 'commits')
  .option('--limit <n>', 'Max contributors to show', '15')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Contributors');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    const topFiles = await client.getTopFiles(100).catch(() => null);
    const fileList = topFiles ?? [];

    const authorMap = new Map<string, { commits: number; files: number; aiCommits: number; totalRisk: number }>();
    for (const f of fileList) {
      const authorCount = f.authorCount || 1;
      const isAI = (f.aiCodeRatio ?? 0) > 0.5;
      const key = `author-${authorCount}`;
      const entry = authorMap.get(key) ?? { commits: 0, files: 0, aiCommits: 0, totalRisk: 0 };
      entry.files++;
      entry.commits += f.changeFrequency90d;
      if (isAI) entry.aiCommits += f.changeFrequency90d;
      entry.totalRisk += f.riskScore;
      authorMap.set(key, entry);
    }

    let contributors: ContributorStat[] = [...authorMap.entries()].map(([name, data]) => ({
      author: name,
      commits: data.commits,
      filesChanged: data.files,
      aiAssistedCommits: data.aiCommits,
      aiUsagePercent: data.commits > 0 ? (data.aiCommits / data.commits) * 100 : 0,
      avgRiskContribution: data.files > 0 ? data.totalRisk / data.files : 0,
    }));

    const sortField = opts.sort as string;
    contributors.sort((a, b) => {
      if (sortField === 'name') return a.author.localeCompare(b.author);
      if (sortField === 'ai') return b.aiUsagePercent - a.aiUsagePercent;
      if (sortField === 'risk') return b.avgRiskContribution - a.avgRiskContribution;
      return b.commits - a.commits;
    });

    contributors = contributors.slice(0, parseInt(opts.limit, 10));

    if (opts.json) {
      console.log(JSON.stringify(contributors, null, 2));
      return;
    }

    console.log(pc.bold(`  ${contributors.length} contributor(s)\n`));

    for (let i = 0; i < contributors.length; i++) {
      const c = contributors[i]!;
      const rank = `#${i + 1}`;
      console.log(`  ${pc.dim(rank.padStart(3))} ${pc.bold(c.author)}`);
      console.log(`      ${pc.dim('Commits:')} ${c.commits}  ${pc.dim('Files:')} ${c.filesChanged}  ${pc.dim('Avg risk:')} ${c.avgRiskContribution.toFixed(3)}`);
      console.log(`      ${pc.dim('AI usage:')} ${usageBar(c.aiUsagePercent)} ${c.aiUsagePercent.toFixed(0)}% (${c.aiAssistedCommits} AI commits)`);
      console.log();
    }
  });
