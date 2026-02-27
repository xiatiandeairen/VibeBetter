import { Command } from 'commander';
import pc from 'picocolors';
import { readFileSync, existsSync } from 'fs';
import { header, warn } from '../utils/display.js';

export const boundaryCommand = new Command('boundary')
  .description('Analyze boundary conditions for a file — find edge cases AI might miss')
  .argument('<file>', 'File to analyze')
  .action(async (file: string) => {
    header(`Boundary Analysis: ${file}`);

    if (!existsSync(file)) {
      warn(`File not found: ${file}`);
      return;
    }

    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    const issues: Array<{ line: number; type: string; detail: string }> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const num = i + 1;

      // Array access without length check
      if (line.match(/\[\d+\]/) && !lines.slice(Math.max(0, i - 3), i).some(l => l.includes('.length'))) {
        issues.push({ line: num, type: 'Array Access', detail: 'Direct index access — check if array is non-empty' });
      }

      // Async without try/catch
      if (line.includes('await ') && !lines.slice(Math.max(0, i - 5), i).some(l => l.includes('try'))) {
        const fnStart = lines.slice(Math.max(0, i - 10), i).findIndex(l => l.includes('async'));
        if (fnStart >= 0) {
          issues.push({ line: num, type: 'Unguarded Await', detail: 'await without try/catch — may throw unhandled' });
        }
      }

      // Empty catch block
      if (line.match(/catch\s*\(/) && lines[i + 1]?.trim() === '}') {
        issues.push({ line: num, type: 'Empty Catch', detail: 'Swallowed error — log or rethrow' });
      }
    }

    if (issues.length === 0) {
      console.log(pc.green('  ✓ No obvious boundary issues detected'));
    } else {
      for (const issue of issues.slice(0, 15)) {
        console.log(`  ${pc.yellow('⚠')} Line ${pc.dim(String(issue.line).padStart(4))}: ${pc.bold(issue.type)}`);
        console.log(`    ${pc.dim(issue.detail)}`);
      }
      if (issues.length > 15) {
        console.log(pc.dim(`  ... and ${issues.length - 15} more`));
      }
    }

    // General boundary checklist
    console.log(pc.bold('\n  Boundary Checklist (review manually):'));
    console.log(pc.dim('  □ What happens with empty input (null, undefined, [], "")?'));
    console.log(pc.dim('  □ What happens with very large input?'));
    console.log(pc.dim('  □ What happens when external service is down?'));
    console.log(pc.dim('  □ What happens with concurrent calls?'));
    console.log(pc.dim('  □ Are all error paths tested?'));
  });
