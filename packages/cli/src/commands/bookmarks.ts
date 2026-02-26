import { Command } from 'commander';
import pc from 'picocolors';
import { header, info } from '../utils/display.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface Bookmark {
  filePath: string;
  label: string;
  addedAt: string;
}

interface BookmarkStore {
  bookmarks: Bookmark[];
}

const BOOKMARK_FILE = '.vibe-bookmarks.json';

function loadBookmarks(): BookmarkStore {
  const bp = path.resolve(process.cwd(), BOOKMARK_FILE);
  if (!fs.existsSync(bp)) return { bookmarks: [] };
  try {
    return JSON.parse(fs.readFileSync(bp, 'utf-8'));
  } catch {
    return { bookmarks: [] };
  }
}

function saveBookmarks(store: BookmarkStore): void {
  const bp = path.resolve(process.cwd(), BOOKMARK_FILE);
  fs.writeFileSync(bp, JSON.stringify(store, null, 2), 'utf-8');
}

export const bookmarksCommand = new Command('bookmarks')
  .description('Manage bookmarked files for quick access')
  .argument('[file]', 'File path to bookmark')
  .option('--label <text>', 'Label for the bookmark')
  .option('--remove', 'Remove the bookmark')
  .option('--list', 'List all bookmarks')
  .option('--clear', 'Remove all bookmarks')
  .option('--json', 'Output as JSON')
  .action(async (file, opts) => {
    header('Bookmarks');

    const store = loadBookmarks();

    if (opts.clear) {
      saveBookmarks({ bookmarks: [] });
      console.log(pc.green('  All bookmarks cleared ✓'));
      return;
    }

    if (opts.list || !file) {
      if (store.bookmarks.length === 0) {
        info('No bookmarks. Add one with: vibe bookmarks <file>');
        return;
      }

      if (opts.json) {
        console.log(JSON.stringify(store.bookmarks, null, 2));
        return;
      }

      console.log(pc.bold(`  🔖 ${store.bookmarks.length} bookmark(s)\n`));
      for (const bm of store.bookmarks) {
        console.log(`  ${pc.cyan('🔖')} ${pc.bold(bm.filePath)}`);
        if (bm.label) console.log(`     ${pc.dim(bm.label)}`);
        console.log(`     ${pc.dim('Added:')} ${bm.addedAt}`);
        console.log();
      }
      return;
    }

    if (opts.remove) {
      store.bookmarks = store.bookmarks.filter((b) => b.filePath !== file);
      saveBookmarks(store);
      console.log(pc.green(`  Removed bookmark: ${file} ✓`));
      return;
    }

    const existing = store.bookmarks.find((b) => b.filePath === file);
    if (existing) {
      if (opts.label) existing.label = opts.label;
      saveBookmarks(store);
      console.log(pc.green(`  Updated bookmark: ${file} ✓`));
    } else {
      store.bookmarks.push({ filePath: file, label: opts.label ?? '', addedAt: new Date().toISOString() });
      saveBookmarks(store);
      console.log(pc.green(`  Bookmarked: ${file} ✓`));
    }
  });
