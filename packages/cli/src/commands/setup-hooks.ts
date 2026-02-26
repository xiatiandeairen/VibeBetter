import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { header, info, success, error } from '../utils/display.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

const PRE_COMMIT_HOOK = `#!/bin/sh
# VibeBetter pre-commit hook
echo "[VibeBetter] Running pre-commit check..."
npx vibe check --ci 2>/dev/null
if [ $? -ne 0 ]; then
  echo "[VibeBetter] Risk threshold exceeded. Commit blocked."
  echo "Use --no-verify to bypass."
  exit 1
fi
`;

const PRE_PUSH_HOOK = `#!/bin/sh
# VibeBetter pre-push hook
echo "[VibeBetter] Running pre-push analysis..."
npx vibe ci --threshold 0.6 2>/dev/null
if [ $? -ne 0 ]; then
  echo "[VibeBetter] Risk threshold exceeded. Push blocked."
  echo "Use --no-verify to bypass."
  exit 1
fi
`;

function findGitDir(): string | null {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    const gitDir = path.join(dir, '.git');
    if (fs.existsSync(gitDir)) return gitDir;
    dir = path.dirname(dir);
  }
  return null;
}

function installHook(hooksDir: string, name: string, content: string): boolean {
  const hookPath = path.join(hooksDir, name);
  if (fs.existsSync(hookPath)) {
    const existing = fs.readFileSync(hookPath, 'utf-8');
    if (existing.includes('VibeBetter')) return false;
  }
  fs.writeFileSync(hookPath, content, { mode: 0o755 });
  return true;
}

export const setupHooksCommand = new Command('setup-hooks')
  .description('One-command setup for pre-commit + pre-push hooks')
  .option('--uninstall', 'Remove VibeBetter hooks')
  .action(async (opts) => {
    header('Git Hooks Setup');
    requireConfig();

    const gitDir = findGitDir();
    if (!gitDir) {
      error('Not inside a git repository');
      return;
    }

    const hooksDir = path.join(gitDir, 'hooks');
    if (!fs.existsSync(hooksDir)) {
      fs.mkdirSync(hooksDir, { recursive: true });
    }

    if (opts.uninstall) {
      for (const name of ['pre-commit', 'pre-push']) {
        const hookPath = path.join(hooksDir, name);
        if (fs.existsSync(hookPath)) {
          const content = fs.readFileSync(hookPath, 'utf-8');
          if (content.includes('VibeBetter')) {
            fs.unlinkSync(hookPath);
            success(`Removed ${name} hook`);
          }
        }
      }
      console.log();
      return;
    }

    const installed: string[] = [];
    if (installHook(hooksDir, 'pre-commit', PRE_COMMIT_HOOK)) installed.push('pre-commit');
    else info('pre-commit hook already exists with VibeBetter');

    if (installHook(hooksDir, 'pre-push', PRE_PUSH_HOOK)) installed.push('pre-push');
    else info('pre-push hook already exists with VibeBetter');

    if (installed.length > 0) {
      success(`Installed: ${installed.join(', ')}`);
    }
    console.log();
    info('Use --no-verify on git commit/push to bypass hooks');
    console.log();
  });
