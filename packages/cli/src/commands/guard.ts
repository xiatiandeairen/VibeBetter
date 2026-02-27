import { Command } from 'commander';
import pc from 'picocolors';
import simpleGit from 'simple-git';
import { readFileSync, existsSync } from 'fs';
import { header, success, warn, error } from '../utils/display.js';

export const guardCommand = new Command('guard')
  .description('Pre-commit gate — quality + boundary + rules compliance')
  .option('--strict', 'Exit code 1 on any issue')
  .action(async (opts: { strict?: boolean }) => {
    header('Guard');
    const git = simpleGit();
    const status = await git.status();
    const files = [...new Set([...status.staged, ...status.modified])].filter(
      (f) => (f.endsWith('.ts') || f.endsWith('.tsx')) && existsSync(f),
    );

    if (files.length === 0) {
      success('No files to check');
      return;
    }

    console.log(`  Checking ${pc.bold(String(files.length))} file(s)...\n`);

    let totalIssues = 0;

    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      const issues: string[] = [];

      // === Quality Checks ===
      if (lines.length > 200) issues.push(`${lines.length} lines (max 200)`);

      const anyMatch = content.match(/:\s*any\b|as\s+any\b/g);
      if (anyMatch) issues.push(`${anyMatch.length}× any type`);

      const consoleMatch = content.match(/console\.(log|debug|info)\(/g);
      if (consoleMatch) issues.push(`${consoleMatch.length}× console.log`);

      if (/throw\s+['"`]/.test(content)) issues.push('Raw string throw — use AppError');

      if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(content)) issues.push('Empty catch block');

      const todoMatch = content.match(/\/\/\s*(TODO|FIXME|HACK)/gi);
      if (todoMatch) issues.push(`${todoMatch.length}× TODO/FIXME`);

      // === Boundary Checks ===
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        if (
          line.includes('await ') &&
          !lines.slice(Math.max(0, i - 5), i).some((l) => l.includes('try'))
        ) {
          const fnCtx = lines.slice(Math.max(0, i - 10), i).some((l) => l.includes('async'));
          if (
            fnCtx &&
            !lines.slice(i, Math.min(lines.length, i + 5)).some((l) => l.includes('catch'))
          ) {
            issues.push(`L${i + 1}: unguarded await`);
            break;
          }
        }
      }

      // === Output ===
      if (issues.length > 0) {
        totalIssues += issues.length;
        console.log(`  ${pc.red('✗')} ${pc.white(file)}`);
        for (const issue of issues) {
          console.log(`    ${pc.yellow('⚠')} ${issue}`);
        }
      } else {
        console.log(`  ${pc.green('✓')} ${pc.dim(file)}`);
      }
    }

    console.log();
    if (totalIssues === 0) {
      success('All checks passed — safe to commit');
      console.log(pc.dim('  Next: `vibe commit` to generate commit message'));
    } else {
      warn(`${totalIssues} issue(s) found`);
      if (opts.strict) {
        error('Strict mode: commit blocked');
        process.exit(1);
      }
    }
  });
