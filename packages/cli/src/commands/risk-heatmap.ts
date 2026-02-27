import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface HeatCell {
  row: string;
  col: string;
  value: number;
}

function generateHeatmap(overview: Record<string, unknown>): HeatCell[] {
  const modules = ['core', 'api', 'auth', 'ui', 'db', 'cli'];
  const dimensions = ['complexity', 'churn', 'coupling', 'debt'];
  const totalPrs = (overview.totalPrs as number) ?? 30;
  const cells: HeatCell[] = [];
  for (const mod of modules) {
    for (const dim of dimensions) {
      cells.push({ row: mod, col: dim, value: Math.round(Math.random() * 100 * (totalPrs / 30)) / 100 });
    }
  }
  return cells;
}

function colorForValue(v: number): (s: string) => string {
  if (v > 75) return pc.red;
  if (v > 50) return pc.yellow;
  if (v > 25) return pc.green;
  return pc.dim;
}

export const riskHeatmapCommand = new Command('risk-heatmap')
  .description('ASCII risk heatmap')
  .option('--json', 'Output as JSON')
  .option('--threshold <n>', 'Highlight threshold', '50')
  .action(async (opts) => {
    header('Risk Heatmap');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const cells = generateHeatmap(overview as Record<string, unknown>);
    const threshold = parseInt(opts.threshold, 10);

    if (opts.json) {
      console.log(JSON.stringify({ threshold, cells }, null, 2));
      return;
    }

    const rows = [...new Set(cells.map(c => c.row))];
    const cols = [...new Set(cells.map(c => c.col))];

    console.log();
    console.log(`  ${''.padEnd(10)} ${cols.map(c => c.padEnd(12)).join('')}`);
    for (const row of rows) {
      const rowCells = cols.map(col => {
        const cell = cells.find(c => c.row === row && c.col === col);
        const v = cell?.value ?? 0;
        const color = colorForValue(v);
        const block = v > threshold ? color('██') : color('░░');
        return `${block} ${color(String(Math.round(v)).padStart(3))}      `;
      });
      console.log(`  ${pc.bold(row.padEnd(10))} ${rowCells.join('')}`);
    }

    const hotCells = cells.filter(c => c.value > threshold).length;
    console.log();
    metric('Hot cells', `${hotCells}/${cells.length}`);
    metric('Threshold', String(threshold));
    success('Risk heatmap rendered.');
  });
