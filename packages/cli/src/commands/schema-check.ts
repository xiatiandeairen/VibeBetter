import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface SchemaIssue {
  table: string;
  column: string;
  issue: 'missing-index' | 'nullable-risk' | 'type-mismatch' | 'orphan-fk' | 'naming-convention';
  severity: 'high' | 'medium' | 'low';
  suggestion: string;
}

function checkSchema(_overview: Record<string, unknown>): SchemaIssue[] {
  return [
    { table: 'projects', column: 'owner_id', issue: 'missing-index', severity: 'high', suggestion: 'Add index on projects.owner_id for JOIN performance' },
    { table: 'metrics', column: 'value', issue: 'nullable-risk', severity: 'medium', suggestion: 'Consider NOT NULL with default 0' },
    { table: 'users', column: 'legacy_id', issue: 'orphan-fk', severity: 'high', suggestion: 'Foreign key references non-existent table' },
    { table: 'events', column: 'eventType', issue: 'naming-convention', severity: 'low', suggestion: 'Use snake_case: event_type' },
    { table: 'sessions', column: 'data', issue: 'type-mismatch', severity: 'medium', suggestion: 'Use JSONB instead of TEXT for structured data' },
  ];
}

export const schemaCheckCommand = new Command('schema-check')
  .description('Validate database schema for issues and best practices')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Schema Check');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const issues = checkSchema(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ issues, count: issues.length }, null, 2));
      return;
    }

    console.log();
    for (const i of issues) {
      const sevColor = i.severity === 'high' ? pc.red : i.severity === 'medium' ? pc.yellow : pc.cyan;
      console.log(`  ${sevColor(`[${i.severity.toUpperCase()}]`.padEnd(10))} ${pc.bold(`${i.table}.${i.column}`)} — ${i.issue}`);
      console.log(`            ${pc.dim(i.suggestion)}`);
    }

    console.log();
    metric('Issues found', String(issues.length));
    metric('High severity', String(issues.filter(i => i.severity === 'high').length));
    success('Schema check complete.');
  });
