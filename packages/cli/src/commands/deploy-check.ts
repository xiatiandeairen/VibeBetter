import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info, success, warn, error, metric } from '../utils/display.js';

interface RiskFactor {
  name: string;
  score: number;
  threshold: number;
  passed: boolean;
}

export const deployCheckCommand = new Command('deploy-check')
  .description('Pre-deployment risk assessment')
  .option('--strict', 'Fail on any warning')
  .option('--psri-max <n>', 'Maximum PSRI score', '0.6')
  .option('--tdi-max <n>', 'Maximum TDI score', '0.6')
  .action(async (opts) => {
    header('Pre-Deploy Risk Assessment');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    if (!overview) {
      info('No metrics available. Run: vibe sync');
      process.exitCode = 1;
      return;
    }

    const psriMax = parseFloat(opts.psriMax) || 0.6;
    const tdiMax = parseFloat(opts.tdiMax) || 0.6;

    const factors: RiskFactor[] = [
      { name: 'PSRI Score', score: overview.psriScore ?? 0, threshold: psriMax, passed: (overview.psriScore ?? 0) <= psriMax },
      { name: 'TDI Score', score: overview.tdiScore ?? 0, threshold: tdiMax, passed: (overview.tdiScore ?? 0) <= tdiMax },
      { name: 'AI Success Rate', score: overview.aiSuccessRate ?? 0, threshold: 0.7, passed: (overview.aiSuccessRate ?? 1) >= 0.7 },
      { name: 'Hotspot Ratio', score: overview.totalFiles > 0 ? overview.hotspotFiles / overview.totalFiles : 0, threshold: 0.2, passed: overview.totalFiles === 0 || overview.hotspotFiles / overview.totalFiles <= 0.2 },
    ];

    console.log(pc.bold('  Risk Factors\n'));
    for (const f of factors) {
      const icon = f.passed ? pc.green('✓') : pc.red('✗');
      const value = f.name.includes('Rate') || f.name.includes('Ratio') ? `${(f.score * 100).toFixed(1)}%` : f.score.toFixed(3);
      console.log(`  ${icon} ${pc.dim(f.name.padEnd(20))} ${value} ${pc.dim(`(threshold: ${f.threshold})`)}`);
    }
    console.log();

    const failures = factors.filter((f) => !f.passed);
    const overallScore = factors.filter((f) => f.passed).length / factors.length;
    metric('Readiness', `${(overallScore * 100).toFixed(0)}%`);

    if (failures.length === 0) {
      success('All checks passed — safe to deploy');
    } else if (opts.strict) {
      error(`${failures.length} check(s) failed — deployment blocked (strict mode)`);
      process.exitCode = 1;
    } else {
      warn(`${failures.length} check(s) need attention before deploying`);
    }
    console.log();
  });
