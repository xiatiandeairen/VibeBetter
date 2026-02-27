export interface HeatmapCell {
  row: string;
  col: string;
  value: number;
  normalizedValue: number;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface HeatmapGrid {
  rows: string[];
  cols: string[];
  cells: HeatmapCell[];
  minValue: number;
  maxValue: number;
  title: string;
}

export interface ColorScale {
  name: string;
  stops: ColorStop[];
  type: 'linear' | 'quantile' | 'threshold';
}

export interface ColorStop {
  value: number;
  color: string;
  label?: string;
}

export interface HeatmapConfig {
  gridId: string;
  colorScale: ColorScale;
  showLabels: boolean;
  showLegend: boolean;
  cellSize: number;
  borderRadius: number;
}
