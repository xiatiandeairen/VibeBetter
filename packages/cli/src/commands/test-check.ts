import { Command } from 'commander';
import pc from 'picocolors';
import simpleGit from 'simple-git';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import { header, success, warn, error as showError, metric } from '../utils/display.js';

export const testCommand = new Command('test')
  .description('Check test coverage and run related tests')
  .option('--run', 'Actually run tests (not just check coverage)')
  .action(async (opts: { run?: boolean }) => {
    header('Test');
    const git = simpleGit();
    const status = await git.status();
    const changed = [...new Set([...status.staged, ...status.modified, ...status.created])]
      .filter(f => (f.endsWith('.ts') || f.endsWith('.tsx')) && !f.includes('.test.'));

    if (changed.length === 0) {
      success('No source files changed');
      return;
    }

    metric('Changed source files', changed.length);

    const withTest: string[] = [];
    const withoutTest: string[] = [];

    for (const file of changed) {
      const testVariants = [
        file.replace(/\.tsx?$/, '.test.ts'),
        file.replace(/\.tsx?$/, '.test.tsx'),
        file.replace(/src\//, 'src/__tests__/').replace(/\.tsx?$/, '.test.ts'),
      ];
      const hasTest = testVariants.some(t => existsSync(t));
      if (hasTest) withTest.push(file);
      else withoutTest.push(file);
    }

    console.log();
    metric('Files with tests', `${withTest.length}/${changed.length}`);

    if (withTest.length > 0) {
      console.log(pc.bold('\n  Covered:'));
      for (const f of withTest) {
        console.log(`  ${pc.green('✓')} ${pc.dim(f)}`);
      }
    }

    if (withoutTest.length > 0) {
      console.log(pc.bold('\n  Missing tests:'));
      for (const f of withoutTest) {
        console.log(`  ${pc.red('✗')} ${f}`);
      }
    }

    if (opts.run) {
      console.log(pc.bold('\n  Running tests...'));
      try {
        const result = execSync('pnpm test', {
          cwd: process.cwd(),
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 60000,
        });
        const testLines = result.split('\n').filter(l => l.includes('Tests'));
        for (const line of testLines) {
          console.log(`  ${pc.green('✓')} ${line.trim()}`);
        }
        success('All tests passed');
      } catch (err) {
        showError('Tests failed');
        if (err instanceof Error && 'stdout' in err) {
          const stdout = (err as { stdout: string }).stdout;
          const failLines = stdout.split('\n').filter((l: string) => l.includes('FAIL') || l.includes('✗'));
          for (const line of failLines.slice(0, 5)) {
            console.log(`  ${pc.red(line.trim())}`);
          }
        }
        process.exit(1);
      }
    }

    console.log();
    const coverage = changed.length > 0 ? Math.round((withTest.length / changed.length) * 100) : 100;
    if (coverage === 100) {
      success('Full test coverage for changed files');
    } else if (coverage >= 50) {
      warn(`${coverage}% test coverage — add tests for uncovered files`);
    } else {
      showError(`${coverage}% test coverage — most changed files lack tests`);
      process.exit(1);
    }
  });
