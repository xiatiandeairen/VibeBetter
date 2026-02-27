import { Command } from 'commander';
import pc from 'picocolors';
import simpleGit from 'simple-git';
import { readFileSync, existsSync } from 'fs';
import { header, success, warn, error as showError } from '../utils/display.js';

export const reviewCommand = new Command('review')
  .description('Review code quality — checks rules, boundaries, and patterns')
  .option('--strict', 'Exit 1 on any issue (for CI/hooks)')
  .action(async (opts: { strict?: boolean }) => {
    header('Review');
    const git = simpleGit();
    const status = await git.status();
    const files = [...new Set([...status.staged, ...status.modified, ...status.created])]
      .filter(f => (f.endsWith('.ts') || f.endsWith('.tsx')) && existsSync(f));

    if (files.length === 0) {
      success('No files to review');
      return;
    }

    console.log(`  Reviewing ${pc.bold(String(files.length))} file(s)...\n`);
    let totalIssues = 0;

    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      const issues: Array<{ severity: 'error' | 'warn'; msg: string }> = [];

      // === RULES COMPLIANCE ===
      if (lines.length > 200)
        issues.push({ severity: 'error', msg: `${lines.length} lines (max 200)` });

      const anyMatch = content.match(/:\s*any\b|as\s+any\b/g);
      if (anyMatch)
        issues.push({ severity: 'error', msg: `${anyMatch.length}× \`any\` type` });

      if (/throw\s+['"`]/.test(content))
        issues.push({ severity: 'error', msg: 'Raw string throw — use AppError' });

      // === BOUNDARY CONDITIONS ===
      const consoleMatch = content.match(/console\.(log|debug|info)\(/g);
      if (consoleMatch)
        issues.push({ severity: 'warn', msg: `${consoleMatch.length}× console.log` });

      if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(content))
        issues.push({ severity: 'error', msg: 'Empty catch block — handle or rethrow' });

      for (let i = 0; i < lines.length; i++) {
        if (lines[i]!.includes('await ') && !lines.slice(Math.max(0, i - 5), i).some(l => l.includes('try'))) {
          if (lines.slice(Math.max(0, i - 10), i).some(l => l.includes('async'))) {
            if (!lines.slice(i, Math.min(lines.length, i + 5)).some(l => l.includes('catch'))) {
              issues.push({ severity: 'warn', msg: `L${i + 1}: unguarded await` });
              break;
            }
          }
        }
      }

      // === PATTERNS ===
      const todoMatch = content.match(/\/\/\s*(TODO|FIXME|HACK)/gi);
      if (todoMatch)
        issues.push({ severity: 'warn', msg: `${todoMatch.length}× TODO/FIXME` });

      let maxIndent = 0;
      for (const line of lines) {
        const indent = (line.match(/^\s*/)?.[0]?.length ?? 0) / 2;
        if (indent > maxIndent) maxIndent = indent;
      }
      if (maxIndent > 5)
        issues.push({ severity: 'warn', msg: `Deep nesting (${maxIndent} levels)` });

      let funcLen = 0, maxFunc = 0;
      for (const line of lines) {
        if (/^\s*(export\s+)?(async\s+)?function\s|=>\s*\{/.test(line)) funcLen = 0;
        funcLen++;
        if (funcLen > maxFunc) maxFunc = funcLen;
      }
      if (maxFunc > 50)
        issues.push({ severity: 'warn', msg: `Long function (~${maxFunc} lines) — split` });

      // === OUTPUT ===
      const errors = issues.filter(i => i.severity === 'error');
      const warns = issues.filter(i => i.severity === 'warn');
      totalIssues += issues.length;

      if (issues.length === 0) {
        console.log(`  ${pc.green('✓')} ${pc.dim(file)}`);
      } else {
        console.log(`  ${errors.length > 0 ? pc.red('✗') : pc.yellow('⚠')} ${pc.white(file)}`);
        for (const i of errors) console.log(`    ${pc.red('✗')} ${i.msg}`);
        for (const i of warns) console.log(`    ${pc.yellow('⚠')} ${i.msg}`);
      }
    }

    console.log();
    const errorCount = files.reduce((sum, f) => {
      if (!existsSync(f)) return sum;
      const c = readFileSync(f, 'utf-8');
      let e = 0;
      if (c.split('\n').length > 200) e++;
      if (/:\s*any\b|as\s+any\b/.test(c)) e++;
      if (/throw\s+['"`]/.test(c)) e++;
      if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(c)) e++;
      return sum + e;
    }, 0);

    if (totalIssues === 0) {
      success('Review passed — code is clean');
    } else if (errorCount > 0) {
      showError(`${errorCount} error(s), ${totalIssues - errorCount} warning(s)`);
      if (opts.strict) process.exit(1);
    } else {
      warn(`${totalIssues} warning(s) — consider fixing`);
      if (opts.strict) process.exit(1);
    }
  });
