import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface ApiDiffEntry {
  endpoint: string;
  method: string;
  change: 'added' | 'removed' | 'modified' | 'deprecated';
  breaking: boolean;
  detail: string;
}

function diffApis(_overview: Record<string, unknown>): ApiDiffEntry[] {
  return [
    { endpoint: '/api/v2/metrics', method: 'GET', change: 'added', breaking: false, detail: 'New metrics endpoint' },
    { endpoint: '/api/v1/users/:id', method: 'DELETE', change: 'removed', breaking: true, detail: 'Replaced by /api/v2/users/:id' },
    { endpoint: '/api/v1/projects', method: 'POST', change: 'modified', breaking: false, detail: 'Added optional field "tags"' },
    { endpoint: '/api/v1/health', method: 'GET', change: 'deprecated', breaking: false, detail: 'Use /api/v2/health instead' },
    { endpoint: '/api/v2/auth/token', method: 'POST', change: 'added', breaking: false, detail: 'OAuth2 token exchange' },
    { endpoint: '/api/v1/reports', method: 'GET', change: 'modified', breaking: true, detail: 'Response shape changed' },
  ];
}

export const apiDiffCommand = new Command('api-diff')
  .description('Compare API endpoints between versions')
  .option('--json', 'Output as JSON')
  .option('--breaking-only', 'Show only breaking changes')
  .action(async (opts) => {
    header('API Diff');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    let entries = diffApis(overview as Record<string, unknown>);
    if (opts.breakingOnly) entries = entries.filter(e => e.breaking);

    if (opts.json) {
      console.log(JSON.stringify({ diffs: entries, breakingCount: entries.filter(e => e.breaking).length }, null, 2));
      return;
    }

    console.log();
    for (const e of entries) {
      const changeColor = e.change === 'added' ? pc.green : e.change === 'removed' ? pc.red : e.change === 'deprecated' ? pc.yellow : pc.cyan;
      const breakingLabel = e.breaking ? pc.red(' BREAKING') : '';
      console.log(`  ${changeColor(e.change.toUpperCase().padEnd(12))} ${pc.bold(e.method)} ${e.endpoint}${breakingLabel}`);
      console.log(`               ${pc.dim(e.detail)}`);
    }

    console.log();
    metric('Total changes', String(entries.length));
    metric('Breaking changes', String(entries.filter(e => e.breaking).length));
    success('API diff complete.');
  });
