import { Command } from 'commander';
import pc from 'picocolors';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { header, metric } from '../utils/display.js';

function findRelatedFiles(
  keyword: string,
  dir: string,
  results: string[] = [],
  depth = 0,
): string[] {
  if (depth > 4 || results.length > 20) return results;
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (entry === 'node_modules' || entry === '.git' || entry === '.next' || entry === 'dist')
        continue;
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        findRelatedFiles(keyword, full, results, depth + 1);
      } else if ((entry.endsWith('.ts') || entry.endsWith('.tsx')) && !entry.endsWith('.test.ts')) {
        const content = readFileSync(full, 'utf-8');
        if (content.toLowerCase().includes(keyword.toLowerCase())) {
          results.push(full);
        }
      }
    }
  } catch {
    /* skip unreadable */
  }
  return results;
}

export const planCommand = new Command('plan')
  .description('Plan implementation — analyze affected files and suggest approach')
  .argument('<task>', 'Task description')
  .action(async (task: string) => {
    header('Plan');
    console.log(`  Task: ${pc.bold(task)}`);
    console.log();

    const keywords = task
      .split(/\s+/)
      .filter(
        (w) =>
          w.length > 3 &&
          !['with', 'that', 'this', 'from', 'into', 'the'].includes(w.toLowerCase()),
      );

    const relatedFiles = new Set<string>();
    for (const kw of keywords.slice(0, 3)) {
      const found = findRelatedFiles(kw, 'apps', []);
      found.forEach((f) => relatedFiles.add(f));
      const found2 = findRelatedFiles(kw, 'packages', []);
      found2.forEach((f) => relatedFiles.add(f));
    }

    if (relatedFiles.size > 0) {
      console.log(pc.bold('  Likely Affected Files:'));
      const sorted = Array.from(relatedFiles).slice(0, 10);
      for (const f of sorted) {
        const lines = readFileSync(f, 'utf-8').split('\n').length;
        const sizeTag = lines > 200 ? pc.red('(large)') : pc.dim(`(${lines}L)`);
        console.log(`  ${pc.dim('→')} ${f} ${sizeTag}`);
      }
    } else {
      console.log(pc.dim('  No obviously related files found.'));
    }

    console.log(pc.bold('\n  Suggested Approach:'));
    console.log(`  ${pc.dim('1.')} Understand: run ${pc.cyan('vibe scan')} to see current state`);
    console.log(
      `  ${pc.dim('2.')} Context: run ${pc.cyan(`vibe prompt "${task}"`)} to generate AI prompt`,
    );
    console.log(`  ${pc.dim('3.')} Implement with AI assistance`);
    console.log(
      `  ${pc.dim('4.')} Validate: run ${pc.cyan('vibe guard')} before committing`,
    );
    console.log(
      `  ${pc.dim('5.')} Review: run ${pc.cyan('vibe review')} to check for edge cases`,
    );
    console.log(
      `  ${pc.dim('6.')} Commit: run ${pc.cyan('vibe commit')} for validated commit`,
    );

    console.log(pc.bold('\n  Risk Assessment:'));
    const highRiskFiles = Array.from(relatedFiles).filter((f) => {
      const content = readFileSync(f, 'utf-8');
      return content.split('\n').length > 200;
    });

    if (highRiskFiles.length > 0) {
      console.log(
        `  ${pc.yellow('⚠')} ${highRiskFiles.length} large file(s) in scope — consider splitting`,
      );
    } else {
      console.log(`  ${pc.green('✓')} No obviously high-risk files`);
    }

    const testFiles = Array.from(relatedFiles).filter((f) => {
      const testPath = f.replace('.ts', '.test.ts');
      return existsSync(testPath);
    });
    metric('Files with tests', `${testFiles.length}/${relatedFiles.size}`);
  });
