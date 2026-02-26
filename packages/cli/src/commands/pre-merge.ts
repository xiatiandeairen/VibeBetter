import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

interface PreMergeCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn' | 'skip';
  message: string;
  severity: 'critical' | 'major' | 'minor';
}

function statusIcon(status: PreMergeCheck['status']): string {
  switch (status) {
    case 'pass': return pc.green('✓');
    case 'fail': return pc.red('✗');
    case 'warn': return pc.yellow('⚠');
    case 'skip': return pc.dim('○');
  }
}

export const preMergeCommand = new Command('pre-merge')
  .description('Run comprehensive pre-merge checks')
  .option('--strict', 'Fail on any warning')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Pre-Merge Checks');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    const checks: PreMergeCheck[] = [];

    if (!overview) {
      checks.push({ name: 'Metrics available', status: 'fail', message: 'No metrics found. Run: vibe sync', severity: 'critical' });
    } else {
      const psri = overview.psriScore ?? 0;
      checks.push({
        name: 'PSRI threshold',
        status: psri <= 0.6 ? 'pass' : psri <= 0.8 ? 'warn' : 'fail',
        message: `PSRI: ${psri.toFixed(3)} (threshold: 0.6)`,
        severity: 'critical',
      });

      const tdi = overview.tdiScore ?? 0;
      checks.push({
        name: 'TDI threshold',
        status: tdi <= 0.5 ? 'pass' : tdi <= 0.7 ? 'warn' : 'fail',
        message: `TDI: ${tdi.toFixed(3)} (threshold: 0.5)`,
        severity: 'major',
      });

      const hotspots = overview.hotspotFiles ?? 0;
      checks.push({
        name: 'Hotspot count',
        status: hotspots <= 10 ? 'pass' : hotspots <= 20 ? 'warn' : 'fail',
        message: `${hotspots} hotspot file(s) (threshold: 10)`,
        severity: 'minor',
      });

      const aiSuccess = overview.aiSuccessRate ?? 0;
      checks.push({
        name: 'AI success rate',
        status: aiSuccess >= 0.5 ? 'pass' : aiSuccess >= 0.3 ? 'warn' : 'fail',
        message: `AI success: ${(aiSuccess * 100).toFixed(1)}% (min: 50%)`,
        severity: 'minor',
      });
    }

    const passed = checks.filter((c) => c.status === 'pass').length;
    const failed = checks.filter((c) => c.status === 'fail').length;
    const warned = checks.filter((c) => c.status === 'warn').length;

    if (opts.json) {
      console.log(JSON.stringify({ passed, failed, warned, checks }, null, 2));
      if (failed > 0 || (opts.strict && warned > 0)) process.exit(1);
      return;
    }

    console.log(pc.bold(`  Pre-merge: ${passed}/${checks.length} passed\n`));

    for (const check of checks) {
      console.log(`  ${statusIcon(check.status)} ${check.name}`);
      console.log(`    ${pc.dim(check.message)}`);
      console.log();
    }

    if (failed > 0) {
      console.log(pc.red(`  ✗ ${failed} check(s) failed — merge not recommended`));
      if (opts.strict) process.exit(1);
    } else if (warned > 0) {
      console.log(pc.yellow(`  ⚠ ${warned} warning(s) — review before merge`));
      if (opts.strict) process.exit(1);
    } else {
      console.log(pc.green('  ✓ All pre-merge checks passed'));
    }
  });
