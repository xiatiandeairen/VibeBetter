import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return '';

  const first = rows[0];
  if (!first) return '';
  const keys = Object.keys(first);
  const lines: string[] = [keys.join(',')];

  for (const row of rows) {
    const values = keys.map((k) => {
      const v = row[k];
      if (v === null || v === undefined) return '';
      const s = String(v);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    });
    lines.push(values.join(','));
  }

  return lines.join('\n');
}

type TableFetcher = (client: ApiClient) => Promise<Array<Record<string, unknown>>>;

export const csvCommand = new Command('csv')
  .description('Export any metric table as CSV')
  .option('--table <name>', 'Table to export: files, decisions, snapshots', 'files')
  .option('--output <file>', 'Write CSV to file')
  .option('--limit <n>', 'Limit number of rows')
  .action(async (opts) => {
    header('CSV Export');

    const config = requireConfig();
    const client = new ApiClient(config);

    const fetchers: Record<string, TableFetcher> = {
      files: async (c) => {
        const data = await c.getTopFiles(100);
        return (data as unknown as Array<Record<string, unknown>>) ?? [];
      },
      decisions: async (c) => {
        const data = await c.getDecisions();
        return (data as unknown as Array<Record<string, unknown>>) ?? [];
      },
      snapshots: async (c) => {
        const data = await c.getSnapshots(100);
        return (data as unknown as Array<Record<string, unknown>>) ?? [];
      },
    };

    const fetcher = fetchers[opts.table];
    if (!fetcher) {
      info(`Unknown table "${opts.table}". Available: ${Object.keys(fetchers).join(', ')}`);
      return;
    }

    let rows: Array<Record<string, unknown>>;
    try {
      rows = await fetcher(client);
    } catch {
      info(`No data available for "${opts.table}". Run: vibe sync`);
      return;
    }

    if (opts.limit) {
      rows = rows.slice(0, Number(opts.limit));
    }

    const csv = toCsv(rows);

    if (!csv) {
      info(`No rows in "${opts.table}"`);
      return;
    }

    if (opts.output) {
      const fs = await import('node:fs');
      fs.writeFileSync(opts.output, csv, 'utf-8');
      info(`${rows.length} rows written to ${pc.bold(opts.output)}`);
    } else {
      console.log(csv);
    }

    console.log();
    info(`Exported ${rows.length} rows from "${opts.table}"`);
  });
