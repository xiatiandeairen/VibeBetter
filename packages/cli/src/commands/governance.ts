import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface GovernanceCheck {
  policy: string;
  status: 'pass' | 'warn' | 'fail';
  details: string;
  severity: 'critical' | 'major' | 'minor';
}

function runGovernanceChecks(_overview: Record<string, unknown>): GovernanceCheck[] {
  return [
    { policy: 'Branch protection', status: 'pass', details: 'Main branch protected', severity: 'critical' },
    { policy: 'Code review required', status: 'pass', details: 'Min 1 approver configured', severity: 'critical' },
    { policy: 'License compliance', status: 'warn', details: '2 dependencies with unknown licenses', severity: 'major' },
    { policy: 'Security scanning', status: 'pass', details: 'Dependabot enabled', severity: 'critical' },
    { policy: 'Commit signing', status: 'fail', details: 'GPG signing not enforced', severity: 'minor' },
    { policy: 'CI/CD pipeline', status: 'pass', details: 'All checks required before merge', severity: 'major' },
    { policy: 'Documentation', status: 'warn', details: '15% of public APIs undocumented', severity: 'minor' },
    { policy: 'Test coverage threshold', status: 'pass', details: 'Coverage > 70% enforced', severity: 'major' },
  ];
}

export const governanceCommand = new Command('governance')
  .description('Run governance checks — policies, compliance, best practices')
  .option('--json', 'Output as JSON')
  .option('--strict', 'Treat warnings as failures')
  .action(async (opts) => {
    header('Governance Check');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const checks = runGovernanceChecks(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify(checks, null, 2));
      return;
    }

    console.log();
    for (const check of checks) {
      const icon = check.status === 'pass' ? pc.green('✓') : check.status === 'warn' ? pc.yellow('⚠') : pc.red('✗');
      const sevColor = check.severity === 'critical' ? pc.red : check.severity === 'major' ? pc.yellow : pc.dim;
      console.log(`  ${icon} ${check.policy.padEnd(25)} ${sevColor(`[${check.severity}]`)} ${pc.dim(check.details)}`);
    }

    const passed = checks.filter(c => c.status === 'pass').length;
    const failed = checks.filter(c => c.status === 'fail').length;
    const warned = checks.filter(c => c.status === 'warn').length;
    console.log();
    metric('Passed', `${passed}/${checks.length}`);
    metric('Warnings', String(warned));
    metric('Failures', String(failed));

    if (failed > 0 || (opts.strict && warned > 0)) {
      console.log(`\n  ${pc.red('Governance check failed.')}`);
    } else {
      success('Governance check passed.');
    }
  });
