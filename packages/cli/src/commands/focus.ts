import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

interface FocusResult {
  filePath: string;
  riskScore: number;
  complexity: number;
  churnRate: number;
}

function riskColor(score: number): (s: string) => string {
  if (score >= 0.7) return pc.red;
  if (score >= 0.4) return pc.yellow;
  return pc.green;
}

export const focusCommand = new Command('focus')
  .description('Filter dashboard to a specific file or directory')
  .argument('<path>', 'File or directory path to focus on')
  .option('--json', 'Output as JSON')
  .option('--sort <field>', 'Sort by: risk, complexity, churn, name', 'risk')
  .option('--limit <n>', 'Max files to show', '25')
  .action(async (targetPath, opts) => {
    header(`Focus: ${targetPath}`);
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    const topFiles = await client.getTopFiles(100).catch(() => null);
    const fileList = topFiles ?? [];
    const filtered: FocusResult[] = fileList
      .filter((f) => f.filePath.startsWith(targetPath) || f.filePath.includes(targetPath))
      .map((f) => ({
        filePath: f.filePath,
        riskScore: f.riskScore,
        complexity: f.cyclomaticComplexity,
        churnRate: f.changeFrequency90d,
      }));

    const sortField = opts.sort as string;
    filtered.sort((a, b) => {
      if (sortField === 'name') return a.filePath.localeCompare(b.filePath);
      if (sortField === 'complexity') return b.complexity - a.complexity;
      if (sortField === 'churn') return b.churnRate - a.churnRate;
      return b.riskScore - a.riskScore;
    });

    const limited = filtered.slice(0, parseInt(opts.limit, 10));

    if (opts.json) {
      console.log(JSON.stringify({ path: targetPath, count: filtered.length, files: limited }, null, 2));
      return;
    }

    if (limited.length === 0) {
      info(`No files matching "${targetPath}". Check the path and try again.`);
      return;
    }

    console.log(pc.bold(`  ${filtered.length} file(s) in ${pc.cyan(targetPath)}\n`));

    for (const f of limited) {
      const color = riskColor(f.riskScore);
      console.log(`  ${color('●')} ${pc.bold(f.filePath)}`);
      console.log(`    ${pc.dim('Risk:')} ${color(f.riskScore.toFixed(3))}  ${pc.dim('Complexity:')} ${f.complexity.toFixed(1)}  ${pc.dim('Churn:')} ${f.churnRate.toFixed(1)}`);
    }

    console.log();
    if (filtered.length > limited.length) {
      info(`Showing ${limited.length} of ${filtered.length} files. Use --limit to see more.`);
    }
  });
