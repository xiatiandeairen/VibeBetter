export interface IncidentRisk {
  id: string;
  area: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  probability: number;
  estimatedImpact: 'severe' | 'moderate' | 'minor';
  predictedTimeframe: string;
  factors: RiskFactor[];
  mitigations: MitigationStrategy[];
  lastUpdated: Date;
}

export interface RiskFactor {
  name: string;
  weight: number;
  currentValue: number;
  threshold: number;
  exceeded: boolean;
  trend: 'increasing' | 'stable' | 'decreasing';
  description: string;
}

export interface MitigationStrategy {
  id: string;
  description: string;
  effort: 'low' | 'medium' | 'high';
  expectedReduction: number;
  priority: number;
  status: 'proposed' | 'in-progress' | 'completed' | 'rejected';
  assignee: string | null;
}

export interface IncidentPredictionReport {
  projectId: string;
  generatedAt: Date;
  overallRiskLevel: 'critical' | 'high' | 'medium' | 'low';
  risks: IncidentRisk[];
  historicalAccuracy: number;
  modelConfidence: number;
  recommendations: string[];
}

export interface PredictionModelConfig {
  lookbackDays: number;
  riskThresholds: Record<string, number>;
  factorWeights: Record<string, number>;
  enableAutoMitigation: boolean;
}
