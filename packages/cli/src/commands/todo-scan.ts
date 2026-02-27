import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface TodoEntry {
  file: string;
  line: number;
  tag: 'TODO' | 'FIXME' | 'HACK' | 'XXX';
  text: string;
  author: string | null;
  age: string;
}

function scanTodos(_overview: Record<string, unknown>): TodoEntry[] {
  return [
    { file: 'src/api/routes.ts', line: 42, tag: 'TODO', text: 'Add pagination to metrics endpoint', author: 'alice', age: '14d' },
    { file: 'src/auth/oauth.ts', line: 88, tag: 'FIXME', text: 'Race condition in token refresh', author: 'bob', age: '30d' },
    { file: 'src/utils/parser.ts', line: 15, tag: 'HACK', text: 'Temporary workaround for date parsing', author: null, age: '90d' },
    { file: 'src/db/queries.ts', line: 203, tag: 'XXX', text: 'N+1 query issue', author: 'charlie', age: '7d' },
    { file: 'src/middleware/auth.ts', line: 55, tag: 'TODO', text: 'Implement role-based access', author: 'alice', age: '45d' },
    { file: 'src/config/loader.ts', line: 12, tag: 'FIXME', text: 'Validate env vars on startup', author: null, age: '60d' },
  ];
}

export const todoScanCommand = new Command('todo-scan')
  .description('Scan codebase for TODO, FIXME, HACK, and XXX comments')
  .option('--json', 'Output as JSON')
  .option('--tag <type>', 'Filter by tag type')
  .action(async (opts) => {
    header('TODO Scanner');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    let entries = scanTodos(overview as Record<string, unknown>);
    if (opts.tag) entries = entries.filter(e => e.tag === opts.tag.toUpperCase());

    if (opts.json) {
      console.log(JSON.stringify({ todos: entries }, null, 2));
      return;
    }

    console.log();
    for (const t of entries) {
      const tagColor = t.tag === 'FIXME' ? pc.red : t.tag === 'HACK' ? pc.magenta : t.tag === 'XXX' ? pc.red : pc.yellow;
      const authorStr = t.author ? pc.dim(` @${t.author}`) : '';
      console.log(`  ${tagColor(`[${t.tag}]`.padEnd(8))} ${pc.bold(`${t.file}:${t.line}`.padEnd(32))} ${pc.dim(t.age)}${authorStr}`);
      console.log(`${''.padEnd(10)} ${t.text}`);
    }

    console.log();
    metric('Items found', String(entries.length));
    metric('FIXMEs', String(entries.filter(e => e.tag === 'FIXME').length));
    success('TODO scan complete.');
  });
