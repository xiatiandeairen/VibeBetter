import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { header, info } from '../utils/display.js';

interface Dimension {
  label: string;
  value: number;
}

function drawRadarAscii(dimensions: Dimension[], size: number): string[] {
  const lines: string[] = [];
  const center = size;
  const rows = size * 2 + 1;
  const cols = size * 4 + 1;
  const grid: string[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ' ')
  );

  for (let r = 1; r <= size; r++) {
    for (let angle = 0; angle < 360; angle += 5) {
      const rad = (angle * Math.PI) / 180;
      const y = Math.round(center - r * Math.cos(rad));
      const x = Math.round(center * 2 + r * 2 * Math.sin(rad));
      const row = grid[y];
      if (y >= 0 && y < rows && x >= 0 && row && x < cols) {
        row[x] = pc.dim('·');
      }
    }
  }

  const n = dimensions.length;
  for (let i = 0; i < n; i++) {
    const dim = dimensions[i];
    if (!dim) continue;
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const r = (dim.value / 100) * size;
    const y = Math.round(center + r * Math.sin(angle));
    const x = Math.round(center * 2 + r * 2 * Math.cos(angle));
    const row = grid[y];
    if (y >= 0 && y < rows && x >= 0 && row && x < cols) {
      row[x] = pc.bold(pc.cyan('●'));
    }

    const ly = Math.round(center + (size + 1) * Math.sin(angle));
    const lx = Math.round(center * 2 + (size + 1) * 2 * Math.cos(angle));
    const label = dim.label.slice(0, 4);
    const labelRow = grid[ly];
    if (ly >= 0 && ly < rows && lx >= 0 && labelRow && lx + label.length < cols) {
      for (let c = 0; c < label.length; c++) {
        labelRow[lx + c] = pc.yellow(label[c]);
      }
    }
  }

  const centerRow = grid[center];
  if (centerRow) {
    centerRow[center * 2] = pc.bold('+');
  }

  for (const row of grid) {
    lines.push('  ' + row.join(''));
  }

  return lines;
}

export const radarCommand = new Command('radar')
  .description('Display ASCII radar chart of PSRI dimensions in terminal')
  .option('--structural <n>', 'Structural complexity (0-100)', '45')
  .option('--change <n>', 'Change frequency (0-100)', '62')
  .option('--defect <n>', 'Defect density (0-100)', '30')
  .option('--architecture <n>', 'Architecture risk (0-100)', '55')
  .option('--runtime <n>', 'Runtime risk (0-100)', '25')
  .option('--coverage-gap <n>', 'Coverage gap (0-100)', '40')
  .option('--size <n>', 'Chart radius in characters', '6')
  .action(async (opts) => {
    header('PSRI Radar Chart');

    requireConfig();

    const dimensions: Dimension[] = [
      { label: 'Structural', value: parseFloat(opts.structural) },
      { label: 'Change', value: parseFloat(opts.change) },
      { label: 'Defect', value: parseFloat(opts.defect) },
      { label: 'Architecture', value: parseFloat(opts.architecture) },
      { label: 'Runtime', value: parseFloat(opts.runtime) },
      { label: 'CovGap', value: parseFloat(opts.coverageGap) },
    ];

    const chart = drawRadarAscii(dimensions, parseInt(opts.size, 10));
    console.log();
    for (const line of chart) {
      console.log(line);
    }
    console.log();

    for (const dim of dimensions) {
      const bar = '█'.repeat(Math.round(dim.value / 5));
      const color = dim.value > 60 ? pc.red : dim.value > 40 ? pc.yellow : pc.green;
      console.log(`  ${dim.label.padEnd(14)} ${color(bar.padEnd(20))} ${dim.value}%`);
    }

    console.log();
    info('Lower values indicate lower risk. Target all dimensions below 40%.');
  });
