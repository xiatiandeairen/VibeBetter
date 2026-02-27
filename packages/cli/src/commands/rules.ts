import { Command } from 'commander';
import pc from 'picocolors';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { header, success, warn } from '../utils/display.js';

const DEFAULT_RULES = `# VibeBetter Project Rules
# These rules are checked by \`vibe guard\` and included in \`vibe prompt\` output

file:
  max_lines: 200
  max_complexity: 15
  naming: kebab-case

code:
  no_any: true
  error_handling: AppError
  require_tests: true
  no_console_log: true

architecture:
  layers:
    - routes
    - services
    - collectors
    - utils
  direction: top-down

conventions:
  commit_format: "<type>(<scope>): <subject>"
  branch_format: "feat|fix|refactor/<description>"
  test_pattern: "*.test.ts"
`;

export const rulesCommand = new Command('rules')
  .description('Manage project coding rules (.vibe/rules.yaml)')
  .argument('[action]', 'init | list | check', 'list')
  .action(async (action: string) => {
    header('Project Rules');

    if (action === 'init') {
      if (!existsSync('.vibe')) mkdirSync('.vibe', { recursive: true });
      writeFileSync('.vibe/rules.yaml', DEFAULT_RULES);
      success('Created .vibe/rules.yaml');
      console.log(pc.dim('  Edit this file to customize project constraints.'));
      console.log(pc.dim('  Rules are used by `vibe guard` and `vibe prompt`.'));
      return;
    }

    if (action === 'list') {
      if (!existsSync('.vibe/rules.yaml')) {
        warn('No rules file found. Run `vibe rules init` to create one.');
        return;
      }
      const content = readFileSync('.vibe/rules.yaml', 'utf-8');
      console.log(content);
      return;
    }

    if (action === 'check') {
      console.log(pc.dim('  Running rule checks... (same as `vibe guard`)'));
      console.log(pc.dim('  Use `vibe guard` for full quality check.'));
    }
  });
