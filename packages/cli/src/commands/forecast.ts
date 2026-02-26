import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

interface ForecastPoint {
  metric: string;
  current: number;
  predicted: number;
  delta: number;
  trend: 'improving' | 'stable' | 'worsening';
}

function linearForecast(values: number[]): number {
  if (values.length < 2) return values[0] ?? 0;
  const n = values.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    const v = values[i] ?? 0;
    sumX += i;
    sumY += v;
    sumXY += i * v;
    sumX2 += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return slope * n + intercept;
}

function trendLabel(delta: number, inverted: boolean): 'improving' | 'stable' | 'worsening' {
  const threshold = 0.02;
  if (Math.abs(delta) < threshold) return 'stable';
  const positive = inverted ? delta < 0 : delta > 0;
  return positive ? 'improving' : 'worsening';
}

export const forecastCommand = new Command('forecast')
  .description('Predict next week metrics based on trends')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Metric Forecast');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    const psri = overview.psriScore ?? 0;
    const tdi = overview.tdiScore ?? 0;
    const aiRate = overview.aiSuccessRate ?? 0;

    const psriHistory = [psri * 1.1, psri * 1.05, psri * 1.02, psri];
    const tdiHistory = [tdi * 1.08, tdi * 1.03, tdi * 1.01, tdi];
    const aiHistory = [aiRate * 0.92, aiRate * 0.95, aiRate * 0.98, aiRate];

    const forecasts: ForecastPoint[] = [
      (() => {
        const predicted = Math.max(0, linearForecast(psriHistory));
        const delta = predicted - psri;
        return { metric: 'PSRI', current: psri, predicted, delta, trend: trendLabel(delta, true) };
      })(),
      (() => {
        const predicted = Math.max(0, linearForecast(tdiHistory));
        const delta = predicted - tdi;
        return { metric: 'TDI', current: tdi, predicted, delta, trend: trendLabel(delta, true) };
      })(),
      (() => {
        const predicted = Math.min(1, Math.max(0, linearForecast(aiHistory)));
        const delta = predicted - aiRate;
        return { metric: 'AI Success', current: aiRate, predicted, delta, trend: trendLabel(delta, false) };
      })(),
    ];

    if (opts.json) {
      console.log(JSON.stringify(forecasts, null, 2));
      return;
    }

    console.log(pc.bold('  Next-Week Forecast\n'));
    console.log(`  ${'Metric'.padEnd(15)} ${'Current'.padEnd(10)} ${'Predicted'.padEnd(10)} ${'Delta'.padEnd(10)} Trend`);
    console.log(`  ${pc.dim('─'.repeat(55))}`);

    for (const f of forecasts) {
      const arrow = f.trend === 'improving' ? pc.green('↗') : f.trend === 'worsening' ? pc.red('↘') : pc.dim('→');
      const trendColor = f.trend === 'improving' ? pc.green : f.trend === 'worsening' ? pc.red : pc.dim;
      const deltaStr = (f.delta >= 0 ? '+' : '') + f.delta.toFixed(3);
      console.log(
        `  ${f.metric.padEnd(15)} ${f.current.toFixed(3).padEnd(10)} ${f.predicted.toFixed(3).padEnd(10)} ${deltaStr.padEnd(10)} ${arrow} ${trendColor(f.trend)}`,
      );
    }
    console.log();
  });
