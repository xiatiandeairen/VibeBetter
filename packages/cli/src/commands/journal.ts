import { Command } from 'commander';
import pc from 'picocolors';
import { header, info } from '../utils/display.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface JournalEntry {
  date: string;
  notes: string[];
  tags: string[];
  createdAt: string;
}

interface JournalStore {
  entries: JournalEntry[];
}

const JOURNAL_FILE = '.vibe-journal.json';

function loadJournal(): JournalStore {
  const jp = path.resolve(process.cwd(), JOURNAL_FILE);
  if (!fs.existsSync(jp)) return { entries: [] };
  try {
    return JSON.parse(fs.readFileSync(jp, 'utf-8'));
  } catch {
    return { entries: [] };
  }
}

function saveJournal(store: JournalStore): void {
  const jp = path.resolve(process.cwd(), JOURNAL_FILE);
  fs.writeFileSync(jp, JSON.stringify(store, null, 2), 'utf-8');
}

function todayKey(): string {
  return new Date().toISOString().split('T')[0]!;
}

export const journalCommand = new Command('journal')
  .description('Log daily AI coding notes and observations')
  .argument('[note...]', 'Note text to add')
  .option('--tag <tags>', 'Comma-separated tags')
  .option('--list', 'List recent journal entries')
  .option('--date <date>', 'Specific date (YYYY-MM-DD)')
  .option('--last <n>', 'Show last N entries', '7')
  .option('--clear', 'Clear all journal entries')
  .option('--json', 'Output as JSON')
  .action(async (noteWords: string[], opts) => {
    header('Journal');

    const store = loadJournal();

    if (opts.clear) {
      saveJournal({ entries: [] });
      console.log(pc.green('  Journal cleared ✓'));
      return;
    }

    if (opts.list || noteWords.length === 0) {
      if (store.entries.length === 0) {
        info('No journal entries. Add one with: vibe journal "your note"');
        return;
      }

      const entries = store.entries
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, parseInt(opts.last));

      if (opts.json) {
        console.log(JSON.stringify(entries, null, 2));
        return;
      }

      console.log(pc.bold(`  📓 ${store.entries.length} journal entries\n`));
      for (const entry of entries) {
        console.log(`  ${pc.cyan('📓')} ${pc.bold(entry.date)}`);
        for (const note of entry.notes) {
          console.log(`     • ${note}`);
        }
        if (entry.tags.length > 0) {
          console.log(`     ${pc.dim('Tags:')} ${entry.tags.map((t) => pc.yellow(`#${t}`)).join(' ')}`);
        }
        console.log();
      }
      return;
    }

    const note = noteWords.join(' ');
    const date = opts.date ?? todayKey();
    const tags: string[] = opts.tag ? (opts.tag as string).split(',').map((t: string) => t.trim()) : [];

    let entry = store.entries.find((e) => e.date === date);
    if (entry) {
      entry.notes.push(note);
      entry.tags = [...new Set([...entry.tags, ...tags])];
    } else {
      entry = { date, notes: [note], tags, createdAt: new Date().toISOString() };
      store.entries.push(entry);
    }

    saveJournal(store);
    console.log(pc.green(`  Added journal entry for ${date} ✓`));
    if (tags.length > 0) {
      console.log(pc.dim(`  Tags: ${tags.map((t) => `#${t}`).join(' ')}`));
    }
  });
