import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

export const ciCommand = new Command('ci')
  .description('Output project metrics as JSON for CI/CD integration')
  .option('--fail-on-risk <threshold>', 'Exit 1 if PSRI exceeds threshold', '0.7')
  .action(async (opts) => {
    header('CI/CD Metrics');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    if (!overview) {
      info('No metrics available.');
      const empty = { status: 'no_data', metrics: null };
      console.log(JSON.stringify(empty, null, 2));
      process.exit(0);
    }

    const threshold = parseFloat(opts.failOnRisk) || 0.7;
    const psri = overview.psriScore ?? 0;
    const pass = psri <= threshold;

    const output = {
      status: pass ? 'pass' : 'fail',
      metrics: {
        aiSuccessRate: overview.aiSuccessRate,
        aiStableRate: overview.aiStableRate,
        psriScore: overview.psriScore,
        tdiScore: overview.tdiScore,
        totalPrs: overview.totalPrs,
        aiPrs: overview.aiPrs,
        hotspotRatio: overview.totalFiles > 0 ? overview.hotspotFiles / overview.totalFiles : 0,
      },
      threshold,
    };

    console.log(JSON.stringify(output, null, 2));

    if (!pass) {
      console.error(pc.red(`\nPSRI ${psri.toFixed(3)} exceeds threshold ${threshold}`));
      process.exit(1);
    }
  });
