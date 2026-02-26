import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info, metric } from '../utils/display.js';

const DEFAULT_WEIGHTS = {
  structural: 0.2,
  change: 0.2,
  defect: 0.2,
  architecture: 0.15,
  runtime: 0.1,
  coverage: 0.15,
} as const;

type WeightKey = keyof typeof DEFAULT_WEIGHTS;

function simulatePsri(
  base: { psriStructural: number | null; psriChange: number | null; psriDefect: number | null },
  weights: Record<WeightKey, number>,
): number {
  const structural = base.psriStructural ?? 0;
  const change = base.psriChange ?? 0;
  const defect = base.psriDefect ?? 0;
  const arch = 0;
  const runtime = 0;
  const coverage = 0;
  return (
    structural * weights.structural +
    change * weights.change +
    defect * weights.defect +
    arch * weights.architecture +
    runtime * weights.runtime +
    coverage * weights.coverage
  );
}

export const whatIfCommand = new Command('what-if')
  .description('Simulate weight changes and show PSRI impact')
  .option('--structural <n>', 'Structural weight')
  .option('--change <n>', 'Change weight')
  .option('--defect <n>', 'Defect weight')
  .option('--architecture <n>', 'Architecture weight')
  .option('--runtime <n>', 'Runtime weight')
  .option('--coverage <n>', 'Coverage weight')
  .action(async (opts) => {
    header('What-If Simulation');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    const newWeights: Record<WeightKey, number> = { ...DEFAULT_WEIGHTS };
    for (const key of Object.keys(DEFAULT_WEIGHTS) as WeightKey[]) {
      if (opts[key]) newWeights[key] = parseFloat(opts[key]);
    }

    const totalWeight = Object.values(newWeights).reduce((s, v) => s + v, 0);
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      console.log(pc.yellow(`\n  ⚠ Weights sum to ${totalWeight.toFixed(2)} (expected 1.0)\n`));
    }

    const basePsri = overview.psriScore ?? 0;
    const simulated = simulatePsri(
      { psriStructural: overview.psriScore, psriChange: overview.psriScore, psriDefect: overview.psriScore },
      newWeights,
    );

    console.log(pc.bold('  Weight Configuration\n'));
    for (const [key, value] of Object.entries(newWeights)) {
      const changed = value !== DEFAULT_WEIGHTS[key as WeightKey];
      const label = key.padEnd(16);
      const val = value.toFixed(2);
      console.log(`  ${changed ? pc.cyan('*') : ' '} ${pc.dim(label)} ${changed ? pc.cyan(pc.bold(val)) : val} ${changed ? pc.dim(`(was ${DEFAULT_WEIGHTS[key as WeightKey]})`) : ''}`);
    }

    console.log();
    console.log(pc.bold('  Simulation Results\n'));
    metric('Current PSRI', basePsri.toFixed(3));
    metric('Simulated PSRI', simulated.toFixed(3));

    const delta = simulated - basePsri;
    const arrow = delta > 0.001 ? pc.red('↑') : delta < -0.001 ? pc.green('↓') : pc.dim('→');
    metric('Change', `${delta >= 0 ? '+' : ''}${delta.toFixed(3)} ${arrow}`);
    console.log();
  });
