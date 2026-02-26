import { Command } from 'commander';
import pc from 'picocolors';
import { loadConfig } from '../config.js';
import { header, info } from '../utils/display.js';

interface RiskItem {
  name: string;
  complexity: number;
  frequency: number;
}

type RiskZone = 'critical' | 'complex' | 'volatile' | 'stable';

function classifyRisk(complexity: number, frequency: number): RiskZone {
  if (complexity >= 0.6 && frequency >= 0.6) return 'critical';
  if (complexity >= 0.6) return 'complex';
  if (frequency >= 0.6) return 'volatile';
  return 'stable';
}

function renderMatrix(items: RiskItem[], width: number, height: number): string[] {
  const lines: string[] = [];
  const grid: string[][] = Array.from({ length: height }, () => Array(width).fill(' '));

  for (const item of items) {
    const x = Math.min(Math.floor(item.frequency * (width - 1)), width - 1);
    const y = Math.min(Math.floor((1 - item.complexity) * (height - 1)), height - 1);
    const zone = classifyRisk(item.complexity, item.frequency);
    const char =
      zone === 'critical' ? pc.red('■') : zone === 'complex' ? pc.yellow('▲') : zone === 'volatile' ? pc.cyan('◆') : pc.green('●');
    const row = grid[y];
    if (row) row[x] = char;
  }

  lines.push(pc.dim('  Complexity'));
  lines.push(pc.dim('  ▲'));

  for (let row = 0; row < height; row++) {
    const label = row === 0 ? 'H' : row === height - 1 ? 'L' : '│';
    lines.push(pc.dim(`  ${label} `) + (grid[row] ?? []).join(''));
  }

  lines.push(pc.dim('    ' + '─'.repeat(width) + '▶ Frequency'));
  lines.push(pc.dim('    L' + ' '.repeat(width - 2) + 'H'));

  return lines;
}

export const matrixCommand = new Command('matrix')
  .description('Risk matrix visualization (complexity vs frequency)')
  .option('--width <n>', 'Matrix width', '40')
  .option('--height <n>', 'Matrix height', '15')
  .action(async (opts) => {
    header('Risk Matrix');

    const config = loadConfig();
    const projectId = config?.projectId ?? 'default';
    info(`Project: ${pc.bold(projectId)}`);
    console.log();

    const sampleItems: RiskItem[] = [
      { name: 'src/core/engine.ts', complexity: 0.9, frequency: 0.8 },
      { name: 'src/api/router.ts', complexity: 0.7, frequency: 0.9 },
      { name: 'src/utils/helpers.ts', complexity: 0.3, frequency: 0.7 },
      { name: 'src/db/queries.ts', complexity: 0.8, frequency: 0.4 },
      { name: 'src/config.ts', complexity: 0.2, frequency: 0.2 },
      { name: 'src/middleware/auth.ts', complexity: 0.6, frequency: 0.6 },
    ];

    const width = parseInt(opts.width, 10);
    const height = parseInt(opts.height, 10);
    const lines = renderMatrix(sampleItems, width, height);

    for (const line of lines) {
      console.log(line);
    }

    console.log();
    console.log(pc.bold('  Legend:'));
    console.log(`    ${pc.red('■')} Critical (high complexity + high frequency)`);
    console.log(`    ${pc.yellow('▲')} Complex (high complexity)`);
    console.log(`    ${pc.cyan('◆')} Volatile (high frequency)`);
    console.log(`    ${pc.green('●')} Stable`);
    console.log();

    for (const item of sampleItems) {
      const zone = classifyRisk(item.complexity, item.frequency);
      const tag =
        zone === 'critical'
          ? pc.red('[CRITICAL]')
          : zone === 'complex'
            ? pc.yellow('[COMPLEX]')
            : zone === 'volatile'
              ? pc.cyan('[VOLATILE]')
              : pc.green('[STABLE]');
      console.log(`  ${tag} ${item.name}  (C=${item.complexity.toFixed(1)} F=${item.frequency.toFixed(1)})`);
    }

    console.log();
    info('Integrate with real analysis data via vibe analyze first');
  });
