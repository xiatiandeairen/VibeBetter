import { Command } from 'commander';
import pc from 'picocolors';
import { existsSync, mkdirSync, writeFileSync, chmodSync } from 'fs';
import { join } from 'path';
import { header, success, warn, error } from '../utils/display.js';

const PRE_COMMIT_SCRIPT = `#!/bin/sh
# VibeBetter pre-commit hook — run vibe check before committing
echo "Running vibe check..."
npx vibe check
exit_code=$?
if [ $exit_code -ne 0 ]; then
  echo "vibe check failed. Commit aborted."
  exit 1
fi
`;

export const hookCommand = new Command('hook')
  .description('Manage git hooks for VibeBetter')
  .argument('<action>', 'Action: install or uninstall')
  .action(async (action: string) => {
    header('Git Hooks');

    const gitDir = join(process.cwd(), '.git');
    if (!existsSync(gitDir)) {
      error('Not a git repository.');
      return;
    }

    const hooksDir = join(gitDir, 'hooks');
    const hookPath = join(hooksDir, 'pre-commit');

    if (action === 'install') {
      if (!existsSync(hooksDir)) mkdirSync(hooksDir, { recursive: true });
      if (existsSync(hookPath)) {
        warn('pre-commit hook already exists. Overwriting...');
      }
      writeFileSync(hookPath, PRE_COMMIT_SCRIPT);
      chmodSync(hookPath, '755');
      success('Installed pre-commit hook (.git/hooks/pre-commit)');
      console.log(pc.dim('  Hook will run `vibe check` before each commit.'));
    } else if (action === 'uninstall') {
      if (!existsSync(hookPath)) {
        warn('No pre-commit hook found.');
        return;
      }
      const { unlinkSync } = await import('fs');
      unlinkSync(hookPath);
      success('Removed pre-commit hook.');
    } else {
      error(`Unknown action: ${action}. Use "install" or "uninstall".`);
    }
  });
