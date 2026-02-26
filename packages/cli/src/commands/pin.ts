import { Command } from 'commander';
import pc from 'picocolors';
import { header, info } from '../utils/display.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface PinnedFile {
  filePath: string;
  note: string;
  pinnedAt: string;
}

interface PinStore {
  pins: PinnedFile[];
}

const PIN_FILE = '.vibe-pins.json';

function loadPins(): PinStore {
  const pinPath = path.resolve(process.cwd(), PIN_FILE);
  if (!fs.existsSync(pinPath)) return { pins: [] };
  try {
    return JSON.parse(fs.readFileSync(pinPath, 'utf-8'));
  } catch {
    return { pins: [] };
  }
}

function savePins(store: PinStore): void {
  const pinPath = path.resolve(process.cwd(), PIN_FILE);
  fs.writeFileSync(pinPath, JSON.stringify(store, null, 2), 'utf-8');
}

export const pinCommand = new Command('pin')
  .description('Pin/bookmark important files for tracking')
  .argument('[file]', 'File path to pin or unpin')
  .option('--note <text>', 'Add a note to the pinned file')
  .option('--remove', 'Unpin the file')
  .option('--list', 'List all pinned files')
  .option('--clear', 'Remove all pins')
  .option('--json', 'Output as JSON')
  .action(async (file, opts) => {
    header('Pin Manager');

    const store = loadPins();

    if (opts.clear) {
      savePins({ pins: [] });
      console.log(pc.green('  All pins cleared ✓'));
      return;
    }

    if (opts.list || !file) {
      if (store.pins.length === 0) {
        info('No pinned files. Pin one with: vibe pin <file>');
        return;
      }

      if (opts.json) {
        console.log(JSON.stringify(store.pins, null, 2));
        return;
      }

      console.log(pc.bold(`  📌 ${store.pins.length} pinned file(s)\n`));
      for (const pin of store.pins) {
        console.log(`  ${pc.cyan('📌')} ${pc.bold(pin.filePath)}`);
        if (pin.note) console.log(`     ${pc.dim(pin.note)}`);
        console.log(`     ${pc.dim('Pinned:')} ${pin.pinnedAt}`);
        console.log();
      }
      return;
    }

    if (opts.remove) {
      store.pins = store.pins.filter((p) => p.filePath !== file);
      savePins(store);
      console.log(pc.green(`  Unpinned: ${file} ✓`));
      return;
    }

    const existing = store.pins.find((p) => p.filePath === file);
    if (existing) {
      if (opts.note) existing.note = opts.note;
      savePins(store);
      console.log(pc.green(`  Updated pin: ${file} ✓`));
    } else {
      store.pins.push({ filePath: file, note: opts.note ?? '', pinnedAt: new Date().toISOString() });
      savePins(store);
      console.log(pc.green(`  Pinned: ${file} ✓`));
    }
  });
