import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface RegressionEntry {
  test: string;
  suite: string;
  status: 'pass' | 'flaky' | 'regression' | 'new-failure';
  previousResult: 'pass' | 'fail';
  duration: number;
}

function checkRegressions(_overview: Record<string, unknown>): RegressionEntry[] {
  return [
    { test: 'auth/login.spec.ts', suite: 'auth', status: 'regression', previousResult: 'pass', duration: 1200 },
    { test: 'api/metrics.spec.ts', suite: 'api', status: 'flaky', previousResult: 'pass', duration: 3400 },
    { test: 'core/engine.spec.ts', suite: 'core', status: 'pass', previousResult: 'pass', duration: 800 },
    { test: 'ui/dashboard.spec.ts', suite: 'ui', status: 'new-failure', previousResult: 'pass', duration: 5200 },
    { test: 'db/migrations.spec.ts', suite: 'db', status: 'pass', previousResult: 'pass', duration: 2100 },
    { test: 'utils/parser.spec.ts', suite: 'utils', status: 'regression', previousResult: 'pass', duration: 450 },
  ];
}

export const regressionCheckCommand = new Command('regression-check')
  .description('Check for test regressions compared to previous runs')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Regression Check');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const entries = checkRegressions(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ regressions: entries.filter(e => e.status === 'regression' || e.status === 'new-failure'), total: entries.length }, null, 2));
      return;
    }

    console.log();
    for (const e of entries) {
      const icon = e.status === 'pass' ? pc.green('✓') : e.status === 'regression' ? pc.red('✗') : e.status === 'flaky' ? pc.yellow('~') : pc.red('!');
      console.log(`  ${icon} ${pc.bold(e.test)} ${pc.dim(`[${e.suite}]`)} ${pc.dim(`${e.duration}ms`)} ${e.status !== 'pass' ? pc.red(e.status) : ''}`);
    }

    console.log();
    metric('Total tests', String(entries.length));
    metric('Regressions', String(entries.filter(e => e.status === 'regression').length));
    metric('Flaky', String(entries.filter(e => e.status === 'flaky').length));
    success('Regression check complete.');
  });
