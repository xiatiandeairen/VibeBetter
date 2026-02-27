import { logger } from './logger.js';

export interface HeatmapInput {
  rows: string[];
  cols: string[];
  values: Record<string, Record<string, number>>;
}

export interface HeatmapOutput {
  cells: HeatmapOutputCell[];
  minValue: number;
  maxValue: number;
  stats: { mean: number; median: number; stdDev: number };
}

export interface HeatmapOutputCell {
  row: string;
  col: string;
  value: number;
  normalized: number;
  percentile: number;
}

export function calculateHeatmap(input: HeatmapInput): HeatmapOutput {
  const cells: HeatmapOutputCell[] = [];
  const allValues: number[] = [];

  for (const row of input.rows) {
    for (const col of input.cols) {
      const value = input.values[row]?.[col] ?? 0;
      allValues.push(value);
      cells.push({ row, col, value, normalized: 0, percentile: 0 });
    }
  }

  const sorted = [...allValues].sort((a, b) => a - b);
  const minValue = sorted[0] ?? 0;
  const maxValue = sorted[sorted.length - 1] ?? 0;
  const range = maxValue - minValue || 1;
  const mean = allValues.reduce((s, v) => s + v, 0) / Math.max(allValues.length, 1);
  const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
  const variance = allValues.reduce((s, v) => s + (v - mean) ** 2, 0) / Math.max(allValues.length, 1);
  const stdDev = Math.sqrt(variance);

  for (const cell of cells) {
    cell.normalized = (cell.value - minValue) / range;
    const rank = sorted.filter(v => v <= cell.value).length;
    cell.percentile = Math.round((rank / Math.max(sorted.length, 1)) * 100);
  }

  logger.info({ rows: input.rows.length, cols: input.cols.length, cells: cells.length }, 'Heatmap calculated');
  return { cells, minValue, maxValue, stats: { mean: Math.round(mean * 100) / 100, median, stdDev: Math.round(stdDev * 100) / 100 } };
}
