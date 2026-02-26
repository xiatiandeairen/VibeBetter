import { Command } from 'commander';
import pc from 'picocolors';
import { loadConfig } from '../config.js';
import { header, info, metric } from '../utils/display.js';
import { execSync } from 'child_process';

function git(cmd: string): string {
  try {
    return execSync(`git ${cmd}`, { encoding: 'utf-8', timeout: 15000 }).trim();
  } catch {
    return '';
  }
}

export const gitStatsCommand = new Command('git-stats')
  .description('Local git statistics (commits/day, authors, file churn)')
  .option('-d, --days <number>', 'Look back N days', '30')
  .action(async (opts) => {
    header('Git Statistics');

    const isGitRepo = git('rev-parse --is-inside-work-tree');
    if (isGitRepo !== 'true') {
      info('Not inside a git repository');
      return;
    }

    const days = parseInt(opts.days, 10) || 30;
    const since = `${days} days ago`;

    const commitCount = git(`log --oneline --since="${since}" | wc -l`).trim();
    const authorList = git(`log --format="%aN" --since="${since}" | sort -u`);
    const authors = authorList ? authorList.split('\n').filter(Boolean) : [];
    const filesChanged = git(`diff --stat HEAD~${Math.min(parseInt(commitCount) || 1, 100)} HEAD --shortstat 2>/dev/null`);

    const totalCommits = parseInt(commitCount) || 0;
    const commitsPerDay = days > 0 ? (totalCommits / days).toFixed(1) : '0';

    const topAuthors = git(`log --format="%aN" --since="${since}" | sort | uniq -c | sort -rn | head -5`);
    const topFiles = git(`log --pretty=format: --name-only --since="${since}" | sort | uniq -c | sort -rn | head -10`);

    console.log(pc.bold('  Overview\n'));
    metric('Period', `Last ${days} days`);
    metric('Total Commits', String(totalCommits));
    metric('Commits/Day', commitsPerDay);
    metric('Unique Authors', String(authors.length));
    console.log();

    if (topAuthors) {
      console.log(pc.bold('  Top Contributors\n'));
      for (const line of topAuthors.split('\n').filter(Boolean)) {
        const match = line.trim().match(/^(\d+)\s+(.+)$/);
        if (match) {
          console.log(`  ${pc.dim(match[1]!.padStart(5))} ${match[2]}`);
        }
      }
      console.log();
    }

    if (topFiles) {
      console.log(pc.bold('  Most Changed Files\n'));
      for (const line of topFiles.split('\n').filter(Boolean).slice(0, 10)) {
        const match = line.trim().match(/^(\d+)\s+(.+)$/);
        if (match) {
          console.log(`  ${pc.dim(match[1]!.padStart(5))} ${pc.dim(match[2]!)}`);
        }
      }
      console.log();
    }
  });
