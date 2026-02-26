import { Command } from 'commander';
import pc from 'picocolors';
import { execSync } from 'node:child_process';
import { header, info } from '../utils/display.js';

interface ChecklistItem {
  file: string;
  checks: string[];
  priority: 'high' | 'medium' | 'low';
}

function getChangedFiles(base: string): string[] {
  try {
    const output = execSync(`git diff --name-only ${base}`, { encoding: 'utf-8' });
    return output.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function categorizeFile(file: string): { checks: string[]; priority: ChecklistItem['priority'] } {
  const ext = file.split('.').pop() ?? '';
  const checks: string[] = [];
  let priority: ChecklistItem['priority'] = 'low';

  if (['ts', 'tsx', 'js', 'jsx'].includes(ext)) {
    checks.push('Verify type safety and null checks');
    checks.push('Check for console.log / debug statements');
    priority = 'medium';
  }

  if (file.includes('test') || file.includes('spec')) {
    checks.push('Ensure test assertions are meaningful');
    checks.push('Check test coverage for edge cases');
    priority = 'medium';
  }

  if (file.includes('migration') || file.includes('schema')) {
    checks.push('Verify migration is reversible');
    checks.push('Check for data loss risk');
    priority = 'high';
  }

  if (file.includes('config') || file.endsWith('.env') || file.endsWith('.json')) {
    checks.push('Review for secrets / hardcoded values');
    checks.push('Verify environment-specific settings');
    priority = 'high';
  }

  if (file.includes('api') || file.includes('route')) {
    checks.push('Validate request input handling');
    checks.push('Check authentication / authorization');
    checks.push('Review error response format');
    priority = 'high';
  }

  if (file.endsWith('.css') || file.endsWith('.scss')) {
    checks.push('Check responsive behavior');
    checks.push('Verify dark mode compatibility');
  }

  if (checks.length === 0) {
    checks.push('General review — verify intent and correctness');
  }

  return { checks, priority };
}

export const preReviewCommand = new Command('pre-review')
  .description('Generate a pre-review checklist based on changed files')
  .option('--base <ref>', 'Base git ref for diff', 'HEAD~1')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Pre-Review Checklist');

    const files = getChangedFiles(opts.base);
    if (files.length === 0) {
      info('No changed files detected. Try: --base main');
      return;
    }

    const checklist: ChecklistItem[] = files.map((file) => {
      const { checks, priority } = categorizeFile(file);
      return { file, checks, priority };
    });

    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    checklist.sort((a, b) => (order[a.priority] ?? 2) - (order[b.priority] ?? 2));

    if (opts.json) {
      console.log(JSON.stringify(checklist, null, 2));
      return;
    }

    console.log(pc.bold(`  ${checklist.length} file(s) to review\n`));
    for (const item of checklist) {
      const icon = item.priority === 'high' ? pc.red('■') : item.priority === 'medium' ? pc.yellow('■') : pc.dim('■');
      console.log(`  ${icon} ${pc.bold(item.file)} ${pc.dim(`[${item.priority}]`)}`);
      for (const check of item.checks) {
        console.log(`    ${pc.dim('☐')} ${check}`);
      }
      console.log();
    }
  });
