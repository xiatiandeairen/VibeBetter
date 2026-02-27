import { Command } from 'commander';
import pc from 'picocolors';
import simpleGit from 'simple-git';
import { readFileSync, existsSync } from 'fs';
import { header, success, warn, error } from '../utils/display.js';

export const guardCommand = new Command('guard')
  .description('Pre-commit quality guard — check AI code against project rules')
  .option('--strict', 'Fail on any warning')
  .action(async (opts: { strict?: boolean }) => {
    header('Quality Guard');
    const git = simpleGit();
    const status = await git.status();
    const files = [...status.staged, ...status.modified].filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

    if (files.length === 0) {
      success('No TypeScript files to check');
      return;
    }

    console.log(`  Checking ${pc.bold(String(files.length))} file(s)...\n`);

    let totalIssues = 0;
    let filesWithIssues = 0;

    for (const file of files) {
      if (!existsSync(file)) continue;
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      const issues: string[] = [];

      // Check file length
      if (lines.length > 200) {
        issues.push(`File too long: ${lines.length} lines (max 200)`);
      }

      // Check for `any` type
      const anyCount = (content.match(/:\s*any\b|as\s+any\b/g) || []).length;
      if (anyCount > 0) {
        issues.push(`Found ${anyCount} 'any' type usage(s)`);
      }

      // Check for console.log
      const consoleCount = (content.match(/console\.(log|debug|info)\(/g) || []).length;
      if (consoleCount > 0) {
        issues.push(`Found ${consoleCount} console.log statement(s)`);
      }

      // Check for raw throw strings
      if (content.includes("throw '") || content.includes('throw "') || content.includes('throw `')) {
        issues.push('Raw string throw — use AppError instead');
      }

      // Check for missing return types on exported functions
      const exportedFns = content.match(/export\s+(async\s+)?function\s+\w+\([^)]*\)\s*{/g) || [];
      for (const fn of exportedFns) {
        if (!fn.includes(':') || fn.includes(': {')) {
          issues.push(`Missing return type on: ${fn.slice(0, 50)}...`);
        }
      }

      // Check for empty catch blocks
      if (content.match(/catch\s*\([^)]*\)\s*{\s*}/)) {
        issues.push('Empty catch block — handle or log the error');
      }

      // Check for TODO/FIXME
      const todoCount = (content.match(/\/\/\s*(TODO|FIXME|HACK|XXX)/gi) || []).length;
      if (todoCount > 0) {
        issues.push(`${todoCount} TODO/FIXME comment(s) — resolve before commit`);
      }

      if (issues.length > 0) {
        filesWithIssues++;
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
      success(`All ${files.length} files passed quality guard`);
    } else {
      warn(`${totalIssues} issue(s) in ${filesWithIssues} file(s)`);
      if (opts.strict) {
        error('Strict mode: blocking commit');
        process.exit(1);
      }
    }
  });
