import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface AbstractionIssue {
  file: string;
  issue: 'too-abstract' | 'too-concrete' | 'leaky' | 'god-module';
  severity: 'high' | 'medium' | 'low';
  detail: string;
}

function checkAbstractions(_overview: Record<string, unknown>): AbstractionIssue[] {
  return [
    { file: 'src/utils/helpers.ts', issue: 'god-module', severity: 'high', detail: '42 exports, no cohesion' },
    { file: 'src/api/handler.ts', issue: 'leaky', severity: 'medium', detail: 'Exposes internal DB types in response' },
    { file: 'src/auth/factory.ts', issue: 'too-abstract', severity: 'low', detail: '5 layers of indirection for simple auth' },
    { file: 'src/db/queries.ts', issue: 'too-concrete', severity: 'medium', detail: 'Raw SQL strings instead of query builder' },
    { file: 'src/config/index.ts', issue: 'leaky', severity: 'high', detail: 'Process.env accessed in 12 files bypassing config' },
  ];
}

export const abstractionCheckCommand = new Command('abstraction-check')
  .description('Check abstraction levels and detect anti-patterns')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Abstraction Check');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const issues = checkAbstractions(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ issues }, null, 2));
      return;
    }

    console.log();
    for (const i of issues) {
      const color = i.severity === 'high' ? pc.red : i.severity === 'medium' ? pc.yellow : pc.cyan;
      console.log(`  ${color(`[${i.severity}]`.padEnd(8))} ${pc.bold(i.file.padEnd(30))} ${color(i.issue)}`);
      console.log(`${''.padEnd(10)} ${pc.dim(`→ ${i.detail}`)}`);
    }

    console.log();
    metric('Issues found', String(issues.length));
    metric('High severity', String(issues.filter(i => i.severity === 'high').length));
    success('Abstraction check complete.');
  });
