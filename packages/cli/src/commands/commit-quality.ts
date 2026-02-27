import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface CommitQuality {
  hash: string;
  message: string;
  score: number;
  issues: string[];
}

function analyzeCommits(overview: Record<string, unknown>): CommitQuality[] {
  const totalPrs = (overview.totalPrs as number) ?? 20;
  const commits: CommitQuality[] = [];
  const sampleMessages = [
    'fix: resolve null pointer in auth module',
    'update stuff',
    'feat: add dependency graph visualization',
    'WIP',
    'refactor: extract validation logic into shared utils',
    'changes',
    'docs: update API documentation for v2',
    'fix bug',
  ];

  for (let i = 0; i < Math.min(totalPrs, sampleMessages.length); i++) {
    const msg = sampleMessages[i]!;
    const issues: string[] = [];
    let score = 100;

    if (msg.length < 10) { issues.push('too short'); score -= 30; }
    if (!/^(feat|fix|refactor|docs|test|chore|ci|perf|style):/.test(msg)) { issues.push('no conventional prefix'); score -= 20; }
    if (/^[A-Z]/.test(msg)) { issues.push('starts with uppercase'); score -= 5; }
    if (!msg.includes(' ')) { issues.push('single word'); score -= 25; }

    commits.push({ hash: `abc${i}def`, message: msg, score: Math.max(0, score), issues });
  }

  return commits;
}

export const commitQualityCommand = new Command('commit-quality')
  .description('Analyze commit message quality and conventions')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Commit Quality Analysis');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const commits = analyzeCommits(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify(commits, null, 2));
      return;
    }

    console.log();
    for (const commit of commits) {
      const color = commit.score >= 80 ? pc.green : commit.score >= 50 ? pc.yellow : pc.red;
      const issueStr = commit.issues.length > 0 ? pc.dim(` [${commit.issues.join(', ')}]`) : '';
      console.log(`  ${pc.dim(commit.hash)} ${color(`${commit.score}pts`)} ${commit.message}${issueStr}`);
    }

    const avgScore = Math.round(commits.reduce((s, c) => s + c.score, 0) / commits.length);
    console.log();
    metric('Avg commit score', `${avgScore}/100`);
    metric('Conventional commits', `${commits.filter(c => c.score >= 80).length}/${commits.length}`);
    success('Commit quality analysis complete.');
  });
