import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { header, info, warn } from '../utils/display.js';

interface DataPoint {
  week: number;
  value: number;
}

function linearRegression(data: DataPoint[]): { slope: number; intercept: number; r2: number } {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0]?.value ?? 0, r2: 0 };

  const sumX = data.reduce((s, d) => s + d.week, 0);
  const sumY = data.reduce((s, d) => s + d.value, 0);
  const sumXY = data.reduce((s, d) => s + d.week * d.value, 0);
  const sumX2 = data.reduce((s, d) => s + d.week * d.week, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const meanY = sumY / n;
  const ssTotal = data.reduce((s, d) => s + (d.value - meanY) ** 2, 0);
  const ssResidual = data.reduce((s, d) => s + (d.value - (slope * d.week + intercept)) ** 2, 0);
  const r2 = ssTotal > 0 ? 1 - ssResidual / ssTotal : 0;

  return { slope: Math.round(slope * 1000) / 1000, intercept: Math.round(intercept * 100) / 100, r2: Math.round(r2 * 1000) / 1000 };
}

function predict(slope: number, intercept: number, week: number): number {
  return Math.round((slope * week + intercept) * 100) / 100;
}

export const predictCommand = new Command('predict')
  .description('Predict future risk trends using linear regression on historical data')
  .option('--metric <name>', 'Metric name (psri, ai-success, coverage)', 'psri')
  .option('--data <values>', 'Comma-separated weekly values (oldest first)', '52,48,50,45,43,42,38,36')
  .option('--weeks <n>', 'Number of weeks to predict ahead', '4')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Trend Prediction');

    requireConfig();

    const values = opts.data.split(',').map((v: string) => parseFloat(v.trim()));
    const data: DataPoint[] = values.map((v: number, i: number) => ({ week: i + 1, value: v }));

    if (data.length < 2) {
      warn('Need at least 2 data points for prediction.');
      return;
    }

    const { slope, intercept, r2 } = linearRegression(data);
    const weeksAhead = parseInt(opts.weeks, 10);
    const lastWeek = data.length;

    const predictions: { week: number; predicted: number }[] = [];
    for (let w = 1; w <= weeksAhead; w++) {
      predictions.push({ week: lastWeek + w, predicted: predict(slope, intercept, lastWeek + w) });
    }

    if (opts.json) {
      console.log(JSON.stringify({ metric: opts.metric, slope, intercept, r2, historical: data, predictions }, null, 2));
      return;
    }

    console.log();
    console.log(`  ${pc.bold('Metric:')} ${opts.metric}`);
    console.log(`  ${pc.bold('Data points:')} ${data.length} weeks`);
    console.log(`  ${pc.bold('Slope:')} ${slope > 0 ? pc.red(`+${slope}`) : pc.green(String(slope))} per week`);
    console.log(`  ${pc.bold('R²:')} ${r2 >= 0.7 ? pc.green(String(r2)) : pc.yellow(String(r2))}`);
    console.log();

    console.log(`  ${pc.bold(pc.cyan('Historical:'))}`);
    for (const d of data) {
      const bar = '█'.repeat(Math.round(d.value / 5));
      console.log(`  Week ${String(d.week).padStart(2)}  ${pc.dim(bar)} ${d.value}`);
    }

    console.log();
    console.log(`  ${pc.bold(pc.cyan('Predicted:'))}`);
    for (const p of predictions) {
      const bar = '▓'.repeat(Math.round(Math.max(0, p.predicted) / 5));
      console.log(`  Week ${String(p.week).padStart(2)}  ${pc.yellow(bar)} ${p.predicted}`);
    }

    console.log();
    if (slope < 0) {
      info(`Trend is ${pc.green('improving')} — ${opts.metric} decreasing by ${Math.abs(slope)} per week.`);
    } else if (slope > 0) {
      warn(`Trend is ${pc.red('worsening')} — ${opts.metric} increasing by ${slope} per week.`);
    } else {
      info('Trend is stable — no significant change detected.');
    }
  });
