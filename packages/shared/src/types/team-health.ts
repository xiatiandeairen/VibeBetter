export type HealthDimensionName =
  | 'code-quality'
  | 'ai-effectiveness'
  | 'velocity'
  | 'risk-management'
  | 'test-coverage'
  | 'collaboration'
  | 'documentation';

export interface TeamHealthDimension {
  name: HealthDimensionName;
  score: number;
  weight: number;
  trend: 'improving' | 'stable' | 'declining';
  details: string;
}

export interface TeamHealthScore {
  teamId: string;
  teamName: string;
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  dimensions: TeamHealthDimension[];
  evaluatedAt: Date;
  previousScore: number | null;
  changePercent: number | null;
}

export interface TeamHealthConfig {
  dimensionWeights: Record<HealthDimensionName, number>;
  thresholds: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  includeInactive: boolean;
  lookbackDays: number;
}

export interface TeamHealthHistory {
  teamId: string;
  snapshots: Array<{
    date: Date;
    score: number;
    dimensions: TeamHealthDimension[];
  }>;
}
