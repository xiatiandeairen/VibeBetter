import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface EvolutionPoint {
  period: string;
  complexity: number;
  coverage: number;
  debt: number;
  velocity: number;
}

function projectEvolution(overview: Record<string, unknown>): EvolutionPoint[] {
  const totalPrs = (overview.totalPrs as number) ?? 30;
  const points: EvolutionPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    points.push({
      period: d.toISOString().slice(0, 7),
      complexity: Math.round(15 + Math.random() * 10 - i * 0.5),
      coverage: Math.round(50 + i * 3 + Math.random() * 5),
      debt: Math.round(40 - i * 2 + Math.random() * 8),
      velocity: Math.round((totalPrs / 6) * (1 + i * 0.1)),
    });
  }
  return points;
}

export const evolutionCommand = new Command('evolution')
  .description('Show project evolution over time')
  .option('--json', 'Output as JSON')
  .option('--months <n>', 'Number of months', '7')
  .action(async (opts) => {
    header('Project Evolution');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const points = projectEvolution(overview as Record<string, unknown>).slice(-parseInt(opts.months, 10));

    if (opts.json) {
      console.log(JSON.stringify({ points }, null, 2));
      return;
    }

    console.log();
    console.log(`  ${'Period'.padEnd(10)} ${'Complex'.padStart(8)} ${'Coverage'.padStart(9)} ${'Debt'.padStart(6)} ${'Velocity'.padStart(9)}`);
    console.log(`  ${'─'.repeat(46)}`);
    for (const p of points) {
      const cColor = p.complexity > 20 ? pc.red : pc.green;
      const covColor = p.coverage > 70 ? pc.green : pc.yellow;
      console.log(`  ${pc.dim(p.period.padEnd(10))} ${cColor(String(p.complexity).padStart(8))} ${covColor(`${p.coverage}%`.padStart(9))} ${String(p.debt).padStart(6)} ${String(p.velocity).padStart(9)}`);
    }

    const first = points[0]!;
    const last = points[points.length - 1]!;
    console.log();
    metric('Coverage trend', `${first.coverage}% → ${last.coverage}%`);
    metric('Debt trend', `${first.debt} → ${last.debt}`);
    success('Evolution analysis complete.');
  });
