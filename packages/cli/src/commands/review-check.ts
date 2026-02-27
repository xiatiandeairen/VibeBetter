import { Command } from 'commander';
import pc from 'picocolors';
import simpleGit from 'simple-git';
import { readFileSync, existsSync } from 'fs';
import { header, success, warn, metric } from '../utils/display.js';

export const reviewCommand = new Command('review')
  .description('Review changes — find edge cases, anti-patterns, missing tests')
  .action(async () => {
    header('Review');
    const git = simpleGit();
    const status = await git.status();
    const files = [
      ...new Set([...status.staged, ...status.modified, ...status.created]),
    ].filter((f) => (f.endsWith('.ts') || f.endsWith('.tsx')) && existsSync(f));

    if (files.length === 0) {
      success('Nothing to review');
      return;
    }

    metric('Files to review', files.length);
    console.log();

    let findings = 0;

    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      const fileFindings: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        if (/catch\s*\(/.test(lines[i]!) && lines[i + 1]?.trim() === '}') {
          fileFindings.push(`L${i + 1}: Swallowed error — log or rethrow`);
        }
      }

      const magicNumbers = content.match(/[^.\d]\b(?:[2-9]\d{2,}|[1-9]\d{3,})\b(?!\s*[;,)\]}])/g);
      if (magicNumbers && magicNumbers.length > 2) {
        fileFindings.push(`${magicNumbers.length} magic numbers — extract to constants`);
      }

      let maxIndent = 0;
      for (const line of lines) {
        const indent = (line.match(/^\s*/)?.[0]?.length ?? 0) / 2;
        if (indent > maxIndent) maxIndent = indent;
      }
      if (maxIndent > 5) {
        fileFindings.push(`Deep nesting (${maxIndent} levels) — consider early returns`);
      }

      let funcLines = 0;
      let maxFuncLines = 0;
      for (const line of lines) {
        if (/^\s*(async\s+)?function\s|=>\s*\{|\.action\(/.test(line)) funcLines = 0;
        funcLines++;
        if (funcLines > maxFuncLines) maxFuncLines = funcLines;
      }
      if (maxFuncLines > 50) {
        fileFindings.push(`Long function (~${maxFuncLines} lines) — consider splitting`);
      }

      if (!file.includes('.test.') && !file.includes('__tests__')) {
        const testPath = file.replace(/\.tsx?$/, '.test.ts');
        if (!existsSync(testPath)) {
          fileFindings.push('No test file — add tests for new logic');
        }
      }

      if (fileFindings.length > 0) {
        findings += fileFindings.length;
        console.log(`  ${pc.yellow('⚠')} ${pc.white(file)}`);
        for (const f of fileFindings) {
          console.log(`    ${pc.dim('→')} ${f}`);
        }
      } else {
        console.log(`  ${pc.green('✓')} ${pc.dim(file)}`);
      }
    }

    console.log();
    if (findings === 0) {
      success('Review passed — no issues found');
    } else {
      warn(`${findings} finding(s) to consider`);
    }
    console.log(pc.dim('  Next: `vibe commit` when ready'));
  });
