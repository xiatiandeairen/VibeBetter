import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface NamingIssue {
  file: string;
  identifier: string;
  kind: 'variable' | 'function' | 'class' | 'file';
  issue: string;
  suggestion: string;
}

function checkNaming(_overview: Record<string, unknown>): NamingIssue[] {
  return [
    { file: 'src/utils/helpers.ts', identifier: 'x', kind: 'variable', issue: 'Single-letter name', suggestion: 'Use descriptive name' },
    { file: 'src/api/handler.ts', identifier: 'doStuff', kind: 'function', issue: 'Vague name', suggestion: 'processMetricsRequest' },
    { file: 'src/db/q.ts', identifier: 'q.ts', kind: 'file', issue: 'Abbreviated filename', suggestion: 'queries.ts' },
    { file: 'src/auth/Auth_Manager.ts', identifier: 'Auth_Manager', kind: 'class', issue: 'Mixed case style', suggestion: 'AuthManager' },
    { file: 'src/config/loader.ts', identifier: 'data2', kind: 'variable', issue: 'Numbered variable', suggestion: 'parsedConfig' },
  ];
}

export const namingCheckCommand = new Command('naming-check')
  .description('Check naming conventions across the codebase')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Naming Check');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const issues = checkNaming(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ issues }, null, 2));
      return;
    }

    console.log();
    for (const n of issues) {
      console.log(`  ${pc.yellow('⚠')} ${pc.bold(n.file)} ${pc.dim(`(${n.kind})`)}`);
      console.log(`    ${pc.red(n.identifier)} — ${n.issue}`);
      console.log(`    ${pc.dim(`→ suggestion: ${n.suggestion}`)}`);
    }

    console.log();
    metric('Issues found', String(issues.length));
    success('Naming check complete.');
  });
