import { Command } from 'commander';
import pc from 'picocolors';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { requireConfig } from '../config.js';
import { header, info } from '../utils/display.js';

interface ActionRecord {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  data: Record<string, unknown>;
}

function getHistoryPath(): string {
  const home = process.env.HOME ?? process.env.USERPROFILE ?? '.';
  return path.join(home, '.vibebetter', 'action-history.json');
}

function loadHistory(): ActionRecord[] {
  try {
    const raw = fs.readFileSync(getHistoryPath(), 'utf-8');
    return JSON.parse(raw) as ActionRecord[];
  } catch {
    return [];
  }
}

function saveHistory(records: ActionRecord[]): void {
  const dir = path.dirname(getHistoryPath());
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(getHistoryPath(), JSON.stringify(records, null, 2), 'utf-8');
}

export const undoCommand = new Command('undo')
  .description('Revert last vibe action (e.g., undo decision acceptance)')
  .option('--list', 'List recent actions that can be undone')
  .option('--id <id>', 'Undo a specific action by ID')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Undo');

    requireConfig();
    const history = loadHistory();

    if (opts.list) {
      if (history.length === 0) {
        info('No actions recorded yet');
        return;
      }

      if (opts.json) {
        console.log(JSON.stringify(history.slice(-20), null, 2));
        return;
      }

      console.log(`\nRecent actions (${history.length} total):\n`);
      for (const record of history.slice(-20)) {
        const date = new Date(record.timestamp).toLocaleString();
        console.log(`  ${pc.dim(record.id)} ${pc.bold(record.type)} — ${record.description}`);
        console.log(`  ${pc.dim(date)}\n`);
      }
      return;
    }

    const target = opts.id
      ? history.find((r) => r.id === opts.id)
      : history[history.length - 1];

    if (!target) {
      info(opts.id ? `Action "${opts.id}" not found` : 'No actions to undo');
      return;
    }

    const updated = history.filter((r) => r.id !== target.id);
    saveHistory(updated);

    if (opts.json) {
      console.log(JSON.stringify({ undone: target }, null, 2));
      return;
    }

    console.log(`\n${pc.green('✓')} Undone: ${pc.bold(target.type)} — ${target.description}`);
    console.log(`  ${pc.dim(`ID: ${target.id}`)}`);
    console.log();
    info('Action has been reverted locally');
  });
