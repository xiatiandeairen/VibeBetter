import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { header, info, success } from '../utils/display.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

const IGNORE_FILE = '.vibeignore';

function loadIgnorePatterns(filePath: string): string[] {
  if (!fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, 'utf-8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
}

function saveIgnorePatterns(filePath: string, patterns: string[]): void {
  const content = ['# VibeBetter ignore file', '# Patterns listed here are excluded from analysis', '', ...patterns, ''].join('\n');
  fs.writeFileSync(filePath, content, 'utf-8');
}

export const ignoreCommand = new Command('ignore')
  .description('Manage files to exclude from analysis')
  .argument('[action]', 'add | remove | list', 'list')
  .argument('[pattern]', 'Glob pattern to add/remove')
  .action(async (action: string, pattern: string | undefined) => {
    header('Ignore Patterns');
    requireConfig();

    const filePath = path.resolve(process.cwd(), IGNORE_FILE);
    const patterns = loadIgnorePatterns(filePath);

    if (action === 'list') {
      if (patterns.length === 0) {
        info(`No ignore patterns. Use: vibe ignore add "dist/**"`);
      } else {
        console.log(pc.bold(`  ${patterns.length} pattern(s):\n`));
        for (const p of patterns) {
          console.log(`  ${pc.dim('•')} ${p}`);
        }
      }
      console.log();
      return;
    }

    if (!pattern) {
      info(`Usage: vibe ignore ${action} <pattern>`);
      return;
    }

    if (action === 'add') {
      if (patterns.includes(pattern)) {
        info(`Pattern already exists: ${pattern}`);
      } else {
        patterns.push(pattern);
        saveIgnorePatterns(filePath, patterns);
        success(`Added: ${pattern}`);
      }
    } else if (action === 'remove') {
      const idx = patterns.indexOf(pattern);
      if (idx === -1) {
        info(`Pattern not found: ${pattern}`);
      } else {
        patterns.splice(idx, 1);
        saveIgnorePatterns(filePath, patterns);
        success(`Removed: ${pattern}`);
      }
    } else {
      info(`Unknown action: ${action}. Use add, remove, or list.`);
    }
    console.log();
  });
