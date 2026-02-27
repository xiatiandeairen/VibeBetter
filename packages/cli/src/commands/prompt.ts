import { Command } from 'commander';
import pc from 'picocolors';
import { readFileSync, existsSync } from 'fs';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header } from '../utils/display.js';

export const promptCommand = new Command('prompt')
  .description('Generate context-rich AI coding prompt')
  .argument('<task>', 'Task description (what you want AI to do)')
  .option('--file <path>', 'Target file for the task')
  .option('--copy', 'Copy to clipboard (requires pbcopy/xclip)')
  .action(async (task: string, opts: { file?: string; copy?: boolean }) => {
    header('Prompt Generator');
    const config = requireConfig();
    const client = new ApiClient(config);

    const lines: string[] = [];
    lines.push(`## Task`);
    lines.push(task);
    lines.push('');

    // Project context
    lines.push(`## Project Context`);
    lines.push(`- TypeScript strict mode (no \`any\`)`);
    lines.push(`- Backend: Hono + Prisma + BullMQ`);
    lines.push(`- Frontend: Next.js 15 + React 19 + Tailwind`);
    lines.push(`- Error handling: use AppError class, not raw throw`);
    lines.push(`- Validation: use Zod schemas from @vibebetter/shared`);
    lines.push('');

    // File context if specified
    if (opts.file && existsSync(opts.file)) {
      const content = readFileSync(opts.file, 'utf-8');
      const lineCount = content.split('\n').length;
      const imports = content.match(/from\s+['"]([^'"]+)['"]/g) || [];

      lines.push(`## Target File: ${opts.file}`);
      lines.push(`- ${lineCount} lines`);
      lines.push(`- Imports: ${imports.map(i => i.replace(/from\s+['"]/, '').replace(/['"]/, '')).join(', ')}`);
      lines.push('');

      // Get risk data
      const topFiles = await client.getTopFiles(100).catch(() => []);
      const fileData = topFiles.find(f => f.filePath.includes(opts.file!));
      if (fileData) {
        lines.push(`## File Risk Profile`);
        lines.push(`- Complexity: ${fileData.cyclomaticComplexity} (${fileData.cyclomaticComplexity > 15 ? 'HIGH' : 'OK'})`);
        lines.push(`- Change frequency: ${fileData.changeFrequency90d} changes in 90 days`);
        lines.push(`- Risk: ${fileData.riskScore > 200 ? 'HIGH' : fileData.riskScore > 50 ? 'MEDIUM' : 'LOW'}`);
        lines.push('');
      }
    }

    // Constraints
    lines.push(`## Constraints`);
    lines.push(`- Keep files under 200 lines`);
    lines.push(`- Cyclomatic complexity under 15 per function`);
    lines.push(`- All new functions must have explicit return types`);
    lines.push(`- Handle null/undefined/empty inputs gracefully`);
    lines.push(`- No new external dependencies without justification`);
    lines.push('');

    // Boundary conditions
    lines.push(`## Boundary Conditions to Handle`);
    lines.push(`- Empty input (null, undefined, empty string, empty array)`);
    lines.push(`- Invalid input (wrong types, out of range values)`);
    lines.push(`- External failures (database down, API timeout, network error)`);
    lines.push(`- Concurrent access (if applicable)`);
    lines.push('');

    // Quality requirements
    lines.push(`## Quality Requirements`);
    lines.push(`- Include unit tests for new logic`);
    lines.push(`- Error messages should be descriptive and actionable`);
    lines.push(`- Use existing patterns from the codebase`);
    lines.push(`- Commit message format: <type>(<scope>): <subject>`);

    const output = lines.join('\n');
    console.log();
    console.log(output);
    console.log();
    console.log(pc.dim('─'.repeat(50)));
    console.log(pc.green('✓ Prompt generated. Copy and paste into your AI coding tool.'));
  });
