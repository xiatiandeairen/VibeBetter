import { Command } from 'commander';
import pc from 'picocolors';
import { header } from '../utils/display.js';

interface FaqEntry {
  question: string;
  answer: string;
  tags: string[];
}

const FAQ_ENTRIES: FaqEntry[] = [
  {
    question: 'What is PSRI?',
    answer: 'PSRI (Project Structural Risk Index) is a composite score from 6 dimensions: structural complexity, change frequency, defect density, architecture risk, runtime risk, and coverage gap. Lower is better.',
    tags: ['metrics', 'psri', 'risk'],
  },
  {
    question: 'How is AI Success Rate calculated?',
    answer: 'AI Success Rate = (AI PRs merged without major revision) / (total AI PRs). A PR is "AI" if it has an AI label or its commits match AI-tool patterns.',
    tags: ['metrics', 'ai', 'success'],
  },
  {
    question: 'What does AI Stable Rate measure?',
    answer: 'AI Stable Rate tracks the percentage of AI-assisted PRs that are deployed without rollback within a configurable window (default 7 days).',
    tags: ['metrics', 'ai', 'stability'],
  },
  {
    question: 'How do I run analysis without a server?',
    answer: 'Use `vibe analyze` for local offline analysis. It parses your git history directly — no backend required.',
    tags: ['commands', 'offline', 'analyze'],
  },
  {
    question: 'What is a hotspot?',
    answer: 'A hotspot is a file with both high complexity and high change frequency. These files carry the most structural risk and should be prioritized for refactoring.',
    tags: ['metrics', 'hotspot', 'risk'],
  },
  {
    question: 'How do I set up alerts for metric thresholds?',
    answer: 'Use the AlertConfig API (POST /api/v1/alerts) to create threshold-based alerts. Combine with `vibe notify` for CLI-side notifications.',
    tags: ['alerts', 'api', 'notifications'],
  },
  {
    question: 'What data does VibeBetter collect?',
    answer: 'VibeBetter collects PR metadata (not code), commit statistics, review metrics, and AI usage labels from GitHub. Local analysis reads only git log data.',
    tags: ['privacy', 'data', 'collection'],
  },
  {
    question: 'How do I export metrics?',
    answer: 'Use `vibe report --format html` for HTML, `vibe csv` for CSV, `vibe ci --json` for JSON, or `vibe export-config` for YAML configuration.',
    tags: ['export', 'reporting', 'commands'],
  },
  {
    question: 'What is TDI?',
    answer: 'TDI (Technical Debt Index) quantifies accumulated technical debt based on complexity, duplication, and test coverage gaps.',
    tags: ['metrics', 'tdi', 'debt'],
  },
  {
    question: 'How often should I run vibe sync?',
    answer: 'We recommend running `vibe sync` at least once daily, or set up a cron/CI job. The server also supports scheduled background collection.',
    tags: ['commands', 'sync', 'scheduling'],
  },
];

export const faqCommand = new Command('faq')
  .description('Frequently asked questions about VibeBetter metrics and commands')
  .option('--search <term>', 'Search FAQ entries by keyword')
  .option('--tag <tag>', 'Filter by tag (metrics, commands, ai, risk, etc.)')
  .action(async (opts) => {
    header('Frequently Asked Questions');

    let entries = FAQ_ENTRIES;

    if (opts.search) {
      const term = opts.search.toLowerCase();
      entries = entries.filter(e =>
        e.question.toLowerCase().includes(term) ||
        e.answer.toLowerCase().includes(term)
      );
    }

    if (opts.tag) {
      entries = entries.filter(e => e.tags.includes(opts.tag.toLowerCase()));
    }

    if (entries.length === 0) {
      console.log(pc.yellow('  No matching FAQ entries found.'));
      return;
    }

    for (const [i, entry] of entries.entries()) {
      console.log();
      console.log(`  ${pc.bold(pc.cyan(`Q${i + 1}:`))} ${pc.bold(entry.question)}`);
      console.log(`  ${pc.dim('A:')} ${entry.answer}`);
      console.log(`  ${pc.dim('Tags:')} ${entry.tags.map(t => pc.dim(`#${t}`)).join(' ')}`);
    }

    console.log();
    console.log(pc.dim(`  ${entries.length} entries shown.`));
  });
