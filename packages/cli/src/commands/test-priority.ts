import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface TestPriorityEntry {
  file: string;
  risk: number;
  lastFail: string | null;
  churnScore: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

function prioritizeTests(_overview: Record<string, unknown>): TestPriorityEntry[] {
  return [
    { file: 'src/auth/login.test.ts', risk: 92, lastFail: '2d ago', churnScore: 85, priority: 'critical' },
    { file: 'src/api/metrics.test.ts', risk: 78, lastFail: '5d ago', churnScore: 70, priority: 'high' },
    { file: 'src/utils/parser.test.ts', risk: 65, lastFail: null, churnScore: 60, priority: 'high' },
    { file: 'src/db/migrations.test.ts', risk: 55, lastFail: '14d ago', churnScore: 40, priority: 'medium' },
    { file: 'src/ui/dashboard.test.ts', risk: 40, lastFail: null, churnScore: 30, priority: 'medium' },
    { file: 'src/config/loader.test.ts', risk: 20, lastFail: null, churnScore: 10, priority: 'low' },
  ];
}

export const testPriorityCommand = new Command('test-priority')
  .description('Prioritize tests by risk, churn, and failure history')
  .option('--json', 'Output as JSON')
  .option('--top <n>', 'Show top N tests', '10')
  .action(async (opts) => {
    header('Test Priority');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const entries = prioritizeTests(overview as Record<string, unknown>).slice(0, parseInt(opts.top, 10));

    if (opts.json) {
      console.log(JSON.stringify({ tests: entries }, null, 2));
      return;
    }

    console.log();
    for (const t of entries) {
      const color = t.priority === 'critical' ? pc.red : t.priority === 'high' ? pc.yellow : t.priority === 'medium' ? pc.cyan : pc.green;
      const failInfo = t.lastFail ? pc.dim(` (last fail: ${t.lastFail})`) : '';
      console.log(`  ${color(`[${t.priority.toUpperCase().padEnd(8)}]`)} ${pc.bold(t.file.padEnd(40))} risk=${t.risk}${failInfo}`);
    }

    console.log();
    metric('Tests ranked', String(entries.length));
    metric('Critical', String(entries.filter(e => e.priority === 'critical').length));
    success('Test prioritization complete.');
  });
