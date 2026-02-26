import { Command } from 'commander';
import pc from 'picocolors';
import { header, metric, info } from '../utils/display.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface CoverageData {
  total: { lines: number; covered: number; pct: number };
  files: Array<{ file: string; lines: number; covered: number; pct: number }>;
}

function loadCoverage(): CoverageData | null {
  const candidates = ['coverage/coverage-summary.json', 'coverage/coverage-final.json'];
  for (const candidate of candidates) {
    const fullPath = path.resolve(process.cwd(), candidate);
    if (fs.existsSync(fullPath)) {
      try {
        const raw = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
        if (raw.total) {
          const total = raw.total.lines ?? raw.total;
          const files = Object.entries(raw)
            .filter(([k]) => k !== 'total')
            .map(([file, v]) => {
              const d = (v as Record<string, { total: number; covered: number; pct: number }>).lines ?? v as { total: number; covered: number; pct: number };
              return { file, lines: d.total, covered: d.covered, pct: d.pct };
            });
          return { total: { lines: total.total, covered: total.covered, pct: total.pct }, files };
        }
      } catch { /* skip */ }
    }
  }
  return null;
}

export const coverageCommand = new Command('coverage')
  .description('Show test coverage data from CI if available')
  .option('--min <pct>', 'Minimum coverage threshold', '80')
  .option('--top <n>', 'Show top N uncovered files', '10')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Test Coverage');

    const data = loadCoverage();
    if (!data) {
      info('No coverage data available. Run tests with coverage to generate data.');
      info('Example: npx vitest --coverage');
      return;
    }

    if (opts.json) {
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    const minPct = parseFloat(opts.min);
    const color = data.total.pct >= minPct ? 'green' : 'red';

    metric('Total Coverage', `${data.total.pct.toFixed(1)}% (${data.total.covered}/${data.total.lines} lines)`, color as 'green' | 'red');
    console.log();

    if (data.total.pct < minPct) {
      console.log(pc.red(`  ⚠ Below minimum threshold of ${minPct}%`));
      console.log();
    }

    const uncovered = data.files
      .filter((f) => f.pct < 100)
      .sort((a, b) => a.pct - b.pct)
      .slice(0, parseInt(opts.top));

    if (uncovered.length > 0) {
      console.log(pc.bold('  Least covered files:\n'));
      for (const f of uncovered) {
        const pctColor = f.pct >= minPct ? pc.green : pc.red;
        console.log(`  ${pctColor(`${f.pct.toFixed(1)}%`.padStart(7))} ${pc.dim(`${f.covered}/${f.lines}`)}  ${f.file}`);
      }
    }

    console.log();
  });
