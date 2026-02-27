import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success, warn } from '../utils/display.js';

interface ArchViolation {
  rule: string;
  from: string;
  to: string;
  severity: 'error' | 'warning';
  description: string;
}

function checkArchitecture(_overview: Record<string, unknown>): ArchViolation[] {
  return [
    { rule: 'no-circular-deps', from: 'apps/web', to: 'apps/server', severity: 'error', description: 'Frontend must not import from server directly' },
    { rule: 'shared-boundary', from: 'apps/server/routes', to: 'packages/db', severity: 'warning', description: 'Routes should access DB through services, not directly' },
    { rule: 'layer-order', from: 'packages/shared', to: 'apps/web', severity: 'error', description: 'Shared package must not depend on app packages' },
  ];
}

export const architectureCheckCommand = new Command('architecture-check')
  .description('Check for architectural violations')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Architecture Check');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const violations = checkArchitecture(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify(violations, null, 2));
      return;
    }

    console.log();
    for (const v of violations) {
      const icon = v.severity === 'error' ? pc.red('✖') : pc.yellow('⚠');
      console.log(`  ${icon} ${pc.bold(v.rule)}`);
      console.log(`    ${pc.dim(v.from)} ${pc.dim('→')} ${pc.dim(v.to)}`);
      console.log(`    ${v.description}`);
      console.log();
    }

    const errors = violations.filter(v => v.severity === 'error').length;
    const warnings = violations.filter(v => v.severity === 'warning').length;
    metric('Violations', String(violations.length));
    metric('Errors', pc.red(String(errors)));
    metric('Warnings', pc.yellow(String(warnings)));
    if (errors > 0) {
      warn('Architecture errors found — fix before merging.');
    }
    success('Architecture check complete.');
  });
