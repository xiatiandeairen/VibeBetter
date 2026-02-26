import { Command } from 'commander';
import pc from 'picocolors';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { header, info } from '../utils/display.js';

interface AliasEntry {
  name: string;
  command: string;
  createdAt: string;
}

interface AliasStore {
  version: number;
  aliases: AliasEntry[];
}

function getStorePath(): string {
  return path.join(process.cwd(), '.vibe', 'aliases.json');
}

function loadAliases(): AliasStore {
  const p = getStorePath();
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'));
  return { version: 1, aliases: [] };
}

function saveAliases(store: AliasStore): void {
  const p = getStorePath();
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, JSON.stringify(store, null, 2));
}

export const aliasCommand = new Command('alias')
  .description('Create custom command aliases')
  .argument('[name]', 'Alias name')
  .argument('[command]', 'Command to alias (e.g. "check --strict")')
  .option('--remove', 'Remove an alias')
  .option('--list', 'List all aliases')
  .action(async (name, command, opts) => {
    header('Command Aliases');
    const store = loadAliases();

    if (opts.list || (!name && !command)) {
      if (store.aliases.length === 0) {
        info('No aliases. Create one: vibe alias c "check --strict"');
        return;
      }
      console.log(pc.bold('  Aliases\n'));
      for (const a of store.aliases) {
        console.log(`  ${pc.cyan(a.name.padEnd(15))} → ${pc.dim('vibe')} ${a.command}`);
      }
      console.log();
      return;
    }

    if (opts.remove && name) {
      store.aliases = store.aliases.filter((a) => a.name !== name);
      saveAliases(store);
      console.log(pc.green(`  ✓ Alias '${name}' removed`));
      return;
    }

    if (name && command) {
      const existing = store.aliases.findIndex((a) => a.name === name);
      const entry: AliasEntry = { name, command, createdAt: new Date().toISOString() };
      if (existing >= 0) {
        store.aliases[existing] = entry;
        console.log(pc.green(`  ✓ Alias '${name}' updated → vibe ${command}`));
      } else {
        store.aliases.push(entry);
        console.log(pc.green(`  ✓ Alias '${name}' created → vibe ${command}`));
      }
      saveAliases(store);
      return;
    }

    if (name && !command) {
      const alias = store.aliases.find((a) => a.name === name);
      if (alias) {
        console.log(`  ${pc.cyan(alias.name)} → ${pc.dim('vibe')} ${alias.command}`);
      } else {
        info(`Alias '${name}' not found`);
      }
    }
  });
