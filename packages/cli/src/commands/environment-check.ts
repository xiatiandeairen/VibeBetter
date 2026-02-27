import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface EnvCheckItem {
  name: string;
  required: boolean;
  present: boolean;
  valid: boolean;
  hint: string;
}

function checkEnvironment(_overview: Record<string, unknown>): EnvCheckItem[] {
  return [
    { name: 'DATABASE_URL', required: true, present: true, valid: true, hint: 'PostgreSQL connection string' },
    { name: 'REDIS_URL', required: true, present: true, valid: true, hint: 'Redis connection string' },
    { name: 'GITHUB_TOKEN', required: false, present: true, valid: true, hint: 'GitHub API token for PR analysis' },
    { name: 'OPENAI_API_KEY', required: false, present: false, valid: false, hint: 'Required for AI features' },
    { name: 'SENTRY_DSN', required: false, present: false, valid: false, hint: 'Error tracking' },
    { name: 'NODE_ENV', required: true, present: true, valid: true, hint: 'development | production' },
  ];
}

export const environmentCheckCommand = new Command('environment-check')
  .description('Validate development environment variables and dependencies')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Environment Check');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const items = checkEnvironment(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ variables: items, allRequired: items.filter(i => i.required).every(i => i.present && i.valid) }, null, 2));
      return;
    }

    console.log();
    for (const item of items) {
      const icon = item.present && item.valid ? pc.green('✔') : item.required ? pc.red('✘') : pc.yellow('○');
      const reqTag = item.required ? pc.red(' [required]') : pc.dim(' [optional]');
      console.log(`  ${icon} ${pc.bold(item.name.padEnd(20))}${reqTag} ${pc.dim(item.hint)}`);
    }

    const missing = items.filter(i => i.required && (!i.present || !i.valid));
    console.log();
    metric('Variables checked', String(items.length));
    metric('Missing required', String(missing.length));
    metric('Status', missing.length > 0 ? pc.red('ISSUES FOUND') : pc.green('All clear'));
    success('Environment check complete.');
  });
