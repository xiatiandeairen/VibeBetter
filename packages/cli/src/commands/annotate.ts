import { Command } from 'commander';
import pc from 'picocolors';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { header, info } from '../utils/display.js';

interface Annotation {
  file: string;
  note: string;
  author: string;
  timestamp: string;
  tags: string[];
}

interface AnnotationStore {
  version: number;
  annotations: Annotation[];
}

function getStorePath(): string {
  return path.join(process.cwd(), '.vibe', 'annotations.json');
}

function loadStore(): AnnotationStore {
  const storePath = getStorePath();
  if (fs.existsSync(storePath)) {
    return JSON.parse(fs.readFileSync(storePath, 'utf-8'));
  }
  return { version: 1, annotations: [] };
}

function saveStore(store: AnnotationStore): void {
  const storePath = getStorePath();
  const dir = path.dirname(storePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
}

export const annotateCommand = new Command('annotate')
  .description('Add notes to files in the risk system')
  .argument('<file>', 'File path to annotate')
  .argument('<note>', 'Note text to attach')
  .option('--author <name>', 'Author name', 'anonymous')
  .option('--tag <tags>', 'Comma-separated tags', '')
  .option('--list', 'List annotations for a file')
  .option('--clear', 'Clear annotations for a file')
  .action(async (file, note, opts) => {
    header('Annotate');
    const store = loadStore();

    if (opts.list) {
      const fileAnnotations = store.annotations.filter((a) => a.file === file);
      if (fileAnnotations.length === 0) {
        info(`No annotations for ${file}`);
        return;
      }
      console.log(pc.bold(`  Annotations for ${pc.cyan(file)}\n`));
      for (const a of fileAnnotations) {
        const tags = a.tags.length > 0 ? ` ${pc.dim('[' + a.tags.join(', ') + ']')}` : '';
        console.log(`  ${pc.dim(a.timestamp)} ${pc.yellow(a.author)}${tags}`);
        console.log(`    ${a.note}\n`);
      }
      return;
    }

    if (opts.clear) {
      store.annotations = store.annotations.filter((a) => a.file !== file);
      saveStore(store);
      console.log(pc.green(`  ✓ Cleared annotations for ${file}`));
      return;
    }

    const annotation: Annotation = {
      file,
      note,
      author: opts.author,
      timestamp: new Date().toISOString(),
      tags: opts.tag ? opts.tag.split(',').map((t: string) => t.trim()) : [],
    };

    store.annotations.push(annotation);
    saveStore(store);
    console.log(pc.green(`  ✓ Annotation added to ${pc.cyan(file)}`));
    console.log(`    ${pc.dim(annotation.note)}`);
  });
