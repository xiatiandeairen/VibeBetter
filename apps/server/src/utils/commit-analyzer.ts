import { logger } from './logger.js';

export interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  date: Date;
  filesChanged: number;
}

export interface CommitAnalysis {
  hash: string;
  score: number;
  hasConventionalPrefix: boolean;
  prefix: string | null;
  hasScope: boolean;
  subjectLength: number;
  hasBody: boolean;
  issues: string[];
}

const CONVENTIONAL_PREFIXES = ['feat', 'fix', 'refactor', 'docs', 'test', 'chore', 'ci', 'perf', 'style', 'build', 'revert'];

export function analyzeCommit(commit: CommitInfo): CommitAnalysis {
  const issues: string[] = [];
  let score = 100;

  const firstLine = commit.message.split('\n')[0] ?? '';
  const hasBody = commit.message.includes('\n\n');

  const prefixMatch = firstLine.match(/^(\w+)(\(.+?\))?:/);
  const prefix = prefixMatch?.[1] ?? null;
  const hasConventionalPrefix = prefix !== null && CONVENTIONAL_PREFIXES.includes(prefix);
  const hasScope = prefixMatch?.[2] !== undefined;

  if (!hasConventionalPrefix) { issues.push('missing conventional prefix'); score -= 20; }
  if (firstLine.length < 10) { issues.push('subject too short'); score -= 25; }
  if (firstLine.length > 72) { issues.push('subject too long (>72 chars)'); score -= 10; }
  if (/^[A-Z]/.test(firstLine.replace(/^\w+(\(.+?\))?:\s*/, ''))) { issues.push('subject starts with uppercase'); score -= 5; }
  if (firstLine.endsWith('.')) { issues.push('subject ends with period'); score -= 5; }

  return {
    hash: commit.hash,
    score: Math.max(0, score),
    hasConventionalPrefix,
    prefix,
    hasScope,
    subjectLength: firstLine.length,
    hasBody,
    issues,
  };
}

export function analyzeCommitBatch(commits: CommitInfo[]): { analyses: CommitAnalysis[]; avgScore: number; complianceRate: number } {
  const analyses = commits.map(analyzeCommit);
  const avgScore = analyses.length > 0
    ? Math.round(analyses.reduce((s, a) => s + a.score, 0) / analyses.length)
    : 0;
  const complianceRate = analyses.length > 0
    ? Math.round(analyses.filter(a => a.score >= 80).length / analyses.length * 100)
    : 0;

  logger.info({ totalCommits: commits.length, avgScore, complianceRate }, 'Commit batch analyzed');
  return { analyses, avgScore, complianceRate };
}
