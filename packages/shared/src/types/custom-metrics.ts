export type MetricDataType = 'number' | 'percentage' | 'ratio' | 'count' | 'duration_ms';
export type AggregationMethod = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'p50' | 'p95' | 'p99';
export type FormulaOperator = 'add' | 'subtract' | 'multiply' | 'divide' | 'percentage';
export type MetricSource = 'api' | 'webhook' | 'computed' | 'manual';

export interface CustomMetric {
  id: string;
  organizationId: string;
  projectId: string | null;
  name: string;
  slug: string;
  description: string;
  dataType: MetricDataType;
  unit: string | null;
  source: MetricSource;
  formula: MetricFormula | null;
  aggregation: AggregationMethod;
  tags: string[];
  thresholds: MetricThreshold;
  displayOrder: number;
  visible: boolean;
  archived: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MetricFormula {
  id: string;
  metricId: string;
  expression: string;
  operands: FormulaOperand[];
  operator: FormulaOperator;
  description: string;
  validated: boolean;
}

export interface FormulaOperand {
  type: 'metric_ref' | 'constant' | 'variable';
  value: string;
  metricId: string | null;
  label: string;
}

export interface MetricThreshold {
  good: { min: number | null; max: number | null };
  warning: { min: number | null; max: number | null };
  critical: { min: number | null; max: number | null };
}

export interface MetricDataPoint {
  metricId: string;
  value: number;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

export interface MetricSnapshot {
  metricId: string;
  name: string;
  currentValue: number;
  previousValue: number | null;
  delta: number | null;
  deltaPercent: number | null;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  lastUpdated: Date;
}
