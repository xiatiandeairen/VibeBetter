import { Command } from 'commander';
import pc from 'picocolors';
import { execSync } from 'node:child_process';
import { header, info } from '../utils/display.js';

interface ReviewerSuggestion {
  reviewer: string;
  score: number;
  reason: string;
  filesOwned: number;
}

function getChangedFiles(base: string): string[] {
  try {
    const out = execSync(`git diff --name-only ${base}`, { encoding: 'utf-8' });
    return out.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function getFileAuthors(file: string): string[] {
  try {
    const out = execSync(`git log --format='%ae' --follow -10 -- "${file}"`, {
      encoding: 'utf-8',
    });
    return [...new Set(out.trim().split('\n').filter(Boolean))];
  } catch {
    return [];
  }
}

function suggestReviewers(files: string[]): ReviewerSuggestion[] {
  const authorScore = new Map<string, { files: number; commits: number }>();

  for (const file of files) {
    const authors = getFileAuthors(file);
    for (const author of authors) {
      const entry = authorScore.get(author) ?? { files: 0, commits: 0 };
      entry.files += 1;
      entry.commits += 1;
      authorScore.set(author, entry);
    }
  }

  const suggestions: ReviewerSuggestion[] = [];
  for (const [reviewer, data] of authorScore.entries()) {
    const score = data.files * 10 + data.commits * 2;
    suggestions.push({
      reviewer,
      score,
      reason: `Owns ${data.files} changed file(s)`,
      filesOwned: data.files,
    });
  }

  return suggestions.sort((a, b) => b.score - a.score).slice(0, 5);
}

export const smartReviewCommand = new Command('smart-review')
  .description('Suggest optimal reviewers based on file ownership')
  .option('--base <ref>', 'Git base ref', 'HEAD~1')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Smart Review — Reviewer Suggestions');

    const files = getChangedFiles(opts.base);

    if (files.length === 0) {
      console.log(pc.dim('  No changed files detected.'));
      return;
    }

    const suggestions = suggestReviewers(files);

    if (opts.json) {
      console.log(JSON.stringify({ changedFiles: files.length, suggestions }, null, 2));
      return;
    }

    console.log();
    console.log(pc.dim(`  ${files.length} changed file(s) analyzed`));
    console.log();

    if (suggestions.length === 0) {
      console.log(pc.dim('  No reviewer suggestions (no git history).'));
      return;
    }

    for (let i = 0; i < suggestions.length; i++) {
      const s = suggestions[i]!;
      const rank = i === 0 ? pc.green('★') : pc.dim(`${i + 1}`);
      console.log(
        `  ${rank} ${pc.bold(s.reviewer)}  score: ${s.score}  ${pc.dim(s.reason)}`,
      );
    }

    console.log();
    info('Reviewers ranked by file ownership and commit history.');
  });
