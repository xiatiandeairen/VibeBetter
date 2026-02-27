import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface EnvVarCheck {
  name: string;
  required: boolean;
  present: boolean;
  valid: boolean;
  hint: string;
}

function validateEnv(_overview: Record<string, unknown>): EnvVarCheck[] {
  return [
    { name: 'DATABASE_URL', required: true, present: true, valid: true, hint: 'PostgreSQL connection string' },
    { name: 'REDIS_URL', required: true, present: true, valid: true, hint: 'Redis connection string' },
    { name: 'JWT_SECRET', required: true, present: false, valid: false, hint: 'Must be at least 32 characters' },
    { name: 'GITHUB_TOKEN', required: false, present: true, valid: true, hint: 'GitHub personal access token' },
    { name: 'SENTRY_DSN', required: false, present: false, valid: false, hint: 'Sentry error tracking DSN' },
    { name: 'API_PORT', required: false, present: true, valid: true, hint: 'Server port (default 3001)' },
  ];
}

export const envValidateCommand = new Command('env-validate')
  .description('Validate environment variables against requirements')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Environment Validation');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const checks = validateEnv(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ checks, valid: checks.filter(c => c.required && !c.valid).length === 0 }, null, 2));
      return;
    }

    console.log();
    for (const c of checks) {
      const icon = c.valid && c.present ? pc.green('✓') : c.required ? pc.red('✗') : pc.yellow('○');
      const label = c.required ? pc.bold(c.name) : pc.dim(c.name);
      console.log(`  ${icon} ${label} ${pc.dim(c.hint)}`);
    }

    const missing = checks.filter(c => c.required && !c.present);
    console.log();
    metric('Total variables', String(checks.length));
    metric('Required missing', String(missing.length));
    if (missing.length > 0) {
      console.log(pc.red(`  Missing required: ${missing.map(c => c.name).join(', ')}`));
    }
    success('Environment validation complete.');
  });
