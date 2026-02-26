import { Command } from 'commander';
import pc from 'picocolors';
import { execSync } from 'node:child_process';
import { header, info } from '../utils/display.js';

interface BranchMetrics {
  branch: string;
  commits: number;
  filesChanged: number;
  insertions: number;
  deletions: number;
  authors: number;
}

function getBranchMetrics(branch: string, base: string): BranchMetrics {
  try {
    const log = execSync(`git log ${base}..${branch} --oneline`, { encoding: 'utf-8' }).trim();
    const commits = log ? log.split('\n').length : 0;

    const diffStat = execSync(`git diff --stat ${base}...${branch}`, { encoding: 'utf-8' }).trim();
    const lines = diffStat.split('\n');
    const summary = lines[lines.length - 1] ?? '';
    const filesMatch = summary.match(/(\d+) files? changed/);
    const insertMatch = summary.match(/(\d+) insertions?/);
    const deleteMatch = summary.match(/(\d+) deletions?/);

    const authorsRaw = execSync(`git log ${base}..${branch} --format="%ae" | sort -u`, {
      encoding: 'utf-8',
      shell: '/bin/bash',
    }).trim();
    const authors = authorsRaw ? authorsRaw.split('\n').length : 0;

    return {
      branch,
      commits,
      filesChanged: filesMatch ? Number(filesMatch[1]) : 0,
      insertions: insertMatch ? Number(insertMatch[1]) : 0,
      deletions: deleteMatch ? Number(deleteMatch[1]) : 0,
      authors,
    };
  } catch {
    return { branch, commits: 0, filesChanged: 0, insertions: 0, deletions: 0, authors: 0 };
  }
}

export const compareBranchesCommand = new Command('compare-branches')
  .description('Compare metrics between git branches')
  .argument('<branch1>', 'First branch')
  .argument('<branch2>', 'Second branch')
  .option('--base <base>', 'Common base branch', 'main')
  .option('--json', 'Output as JSON')
  .action(async (branch1: string, branch2: string, opts) => {
    header('Branch Comparison');

    const m1 = getBranchMetrics(branch1, opts.base);
    const m2 = getBranchMetrics(branch2, opts.base);

    if (opts.json) {
      console.log(JSON.stringify({ branch1: m1, branch2: m2 }, null, 2));
      return;
    }

    const pad = (s: string, n: number) => s.padEnd(n);
    const numPad = (v: number, n: number) => String(v).padStart(n);

    console.log(`\n${pad('Metric', 18)} ${pad(branch1, 14)} ${pad(branch2, 14)} ${pad('Diff', 10)}`);
    console.log('─'.repeat(56));

    const rows: Array<[string, number, number]> = [
      ['Commits', m1.commits, m2.commits],
      ['Files Changed', m1.filesChanged, m2.filesChanged],
      ['Insertions', m1.insertions, m2.insertions],
      ['Deletions', m1.deletions, m2.deletions],
      ['Authors', m1.authors, m2.authors],
    ];

    for (const [label, v1, v2] of rows) {
      const diff = v1 - v2;
      const diffStr = diff === 0 ? '=' : diff > 0 ? pc.green(`+${diff}`) : pc.red(`${diff}`);
      console.log(`${pad(label, 18)} ${numPad(v1, 14)} ${numPad(v2, 14)} ${diffStr}`);
    }

    console.log();
    info(`Compared against base: ${opts.base}`);
  });
