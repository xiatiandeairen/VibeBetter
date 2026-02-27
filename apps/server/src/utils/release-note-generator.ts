import { logger } from './logger.js';

export interface ConventionalCommit {
  hash: string;
  type: string;
  scope: string | null;
  message: string;
  breaking: boolean;
  author: string;
  prNumber: number | null;
}

export interface GeneratedReleaseNotes {
  version: string;
  markdown: string;
  features: number;
  fixes: number;
  breaking: number;
  contributors: string[];
}

export function generateReleaseNotes(
  version: string,
  commits: ConventionalCommit[],
): GeneratedReleaseNotes {
  if (commits.length === 0) {
    logger.warn('No commits provided for release notes generation');
    return { version, markdown: `# ${version}\n\nNo changes.`, features: 0, fixes: 0, breaking: 0, contributors: [] };
  }

  const groups: Record<string, ConventionalCommit[]> = {};
  for (const c of commits) {
    (groups[c.type] ??= []).push(c);
  }

  const lines: string[] = [`# ${version}`, ''];
  const typeLabels: Record<string, string> = {
    feat: 'Features', fix: 'Bug Fixes', perf: 'Performance', docs: 'Documentation',
    chore: 'Chores', refactor: 'Refactoring', test: 'Tests',
  };

  const breakingCommits = commits.filter(c => c.breaking);
  if (breakingCommits.length > 0) {
    lines.push('## ⚠️ Breaking Changes', '');
    for (const c of breakingCommits) {
      const scope = c.scope ? `**${c.scope}:** ` : '';
      const pr = c.prNumber ? ` (#${c.prNumber})` : '';
      lines.push(`- ${scope}${c.message}${pr}`);
    }
    lines.push('');
  }

  for (const [type, items] of Object.entries(groups)) {
    if (type === 'breaking') continue;
    const label = typeLabels[type] ?? type;
    lines.push(`## ${label}`, '');
    for (const item of items) {
      const scope = item.scope ? `**${item.scope}:** ` : '';
      const pr = item.prNumber ? ` (#${item.prNumber})` : '';
      lines.push(`- ${scope}${item.message}${pr}`);
    }
    lines.push('');
  }

  const contributors = [...new Set(commits.map(c => c.author))];
  lines.push('## Contributors', '', ...contributors.map(c => `- @${c}`), '');

  const markdown = lines.join('\n');

  logger.info({ version, commits: commits.length, features: (groups['feat'] ?? []).length, fixes: (groups['fix'] ?? []).length }, 'Release notes generated');

  return {
    version,
    markdown,
    features: (groups['feat'] ?? []).length,
    fixes: (groups['fix'] ?? []).length,
    breaking: breakingCommits.length,
    contributors,
  };
}
