export interface Objective {
  id: string;
  title: string;
  description: string;
  owner: string;
  quarter: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  keyResults: KeyResult[];
  progress: OKRProgress;
  createdAt: Date;
  updatedAt: Date;
}

export interface KeyResult {
  id: string;
  objectiveId: string;
  title: string;
  metricName: string;
  startValue: number;
  currentValue: number;
  targetValue: number;
  unit: string;
  progress: number;
  confidence: 'on-track' | 'at-risk' | 'off-track';
  lastUpdated: Date;
}

export interface OKRProgress {
  overall: number;
  byKeyResult: { keyResultId: string; progress: number }[];
  trend: 'improving' | 'declining' | 'stable';
  projectedCompletion: number;
  daysRemaining: number;
}

export interface OKRConfig {
  quarters: string[];
  scoringMethod: 'average' | 'weighted' | 'min';
  autoUpdateFromMetrics: boolean;
  notifyOnRisk: boolean;
  riskThreshold: number;
}
