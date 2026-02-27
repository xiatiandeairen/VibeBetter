export interface BenchmarkSuite {
  id: string;
  name: string;
  description: string;
  version: string;
  metrics: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BenchmarkResult {
  id: string;
  suiteId: string;
  projectId: string;
  runAt: Date;
  metrics: BenchmarkMetric[];
  overallScore: number;
  rank?: number;
  percentile?: number;
  metadata: Record<string, unknown>;
}

export interface BenchmarkMetric {
  name: string;
  value: number;
  unit: string;
  weight: number;
  normalizedScore: number;
  industryAvg?: number;
  industryP90?: number;
}

export interface Comparison {
  suiteId: string;
  baselineId: string;
  candidateId: string;
  improvements: MetricDelta[];
  regressions: MetricDelta[];
  unchanged: string[];
  overallDelta: number;
  verdict: 'better' | 'worse' | 'comparable';
}

export interface MetricDelta {
  metric: string;
  baselineValue: number;
  candidateValue: number;
  delta: number;
  deltaPercent: number;
  significant: boolean;
}

export interface BenchmarkConfig {
  suiteId: string;
  schedule?: string;
  compareWithIndustry: boolean;
  notifyOnRegression: boolean;
  regressionThresholdPct: number;
}
