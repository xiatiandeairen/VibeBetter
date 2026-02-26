import { Command } from 'commander';
import pc from 'picocolors';
import { header, info } from '../utils/display.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface Reminder {
  id: string;
  metric: string;
  threshold: number;
  direction: 'above' | 'below';
  message: string;
  createdAt: string;
}

interface ReminderStore {
  reminders: Reminder[];
}

const REMINDER_FILE = '.vibe-reminders.json';

function loadReminders(): ReminderStore {
  const rp = path.resolve(process.cwd(), REMINDER_FILE);
  if (!fs.existsSync(rp)) return { reminders: [] };
  try {
    return JSON.parse(fs.readFileSync(rp, 'utf-8'));
  } catch {
    return { reminders: [] };
  }
}

function saveReminders(store: ReminderStore): void {
  const rp = path.resolve(process.cwd(), REMINDER_FILE);
  fs.writeFileSync(rp, JSON.stringify(store, null, 2), 'utf-8');
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export const remindCommand = new Command('remind')
  .description('Set metric check reminders')
  .option('--add', 'Add a new reminder')
  .option('--metric <name>', 'Metric name (e.g. psriScore, aiSuccessRate)')
  .option('--threshold <n>', 'Threshold value', parseFloat)
  .option('--direction <dir>', 'Trigger direction: above or below', 'above')
  .option('--message <text>', 'Reminder message')
  .option('--remove <id>', 'Remove a reminder by ID')
  .option('--list', 'List all reminders')
  .option('--clear', 'Remove all reminders')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Reminders');

    const store = loadReminders();

    if (opts.clear) {
      saveReminders({ reminders: [] });
      console.log(pc.green('  All reminders cleared ✓'));
      return;
    }

    if (opts.remove) {
      store.reminders = store.reminders.filter((r) => r.id !== opts.remove);
      saveReminders(store);
      console.log(pc.green(`  Removed reminder: ${opts.remove} ✓`));
      return;
    }

    if (opts.add && opts.metric && opts.threshold !== undefined) {
      const reminder: Reminder = {
        id: generateId(),
        metric: opts.metric,
        threshold: opts.threshold,
        direction: opts.direction as 'above' | 'below',
        message: opts.message ?? `${opts.metric} ${opts.direction} ${opts.threshold}`,
        createdAt: new Date().toISOString(),
      };
      store.reminders.push(reminder);
      saveReminders(store);
      console.log(pc.green(`  Reminder set: ${reminder.message} (id: ${reminder.id}) ✓`));
      return;
    }

    if (store.reminders.length === 0) {
      info('No reminders set. Add one with: vibe remind --add --metric <name> --threshold <n>');
      return;
    }

    if (opts.json) {
      console.log(JSON.stringify(store.reminders, null, 2));
      return;
    }

    console.log(pc.bold(`  ⏰ ${store.reminders.length} reminder(s)\n`));
    for (const r of store.reminders) {
      console.log(`  ${pc.cyan('⏰')} ${pc.bold(r.metric)} ${r.direction} ${r.threshold}`);
      console.log(`     ${pc.dim(r.message)}`);
      console.log(`     ${pc.dim('ID:')} ${r.id}  ${pc.dim('Created:')} ${r.createdAt}`);
      console.log();
    }
  });
