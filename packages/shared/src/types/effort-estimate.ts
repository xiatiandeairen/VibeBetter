export interface EffortEstimateItem {
  id: string;
  task: string;
  complexity: 'trivial' | 'small' | 'medium' | 'large' | 'epic';
  estimatedHours: number;
  confidence: number;
  riskFactors: string[];
  dependencies: string[];
}

export interface EffortEstimateReport {
  id: string;
  projectId: string;
  generatedAt: Date;
  items: EffortEstimateItem[];
  totalHours: number;
  avgConfidence: number;
  criticalPath: string[];
}

export interface EffortEstimateConfig {
  useHistoricalData: boolean;
  complexityMultipliers: Record<string, number>;
  bufferPercent: number;
  includeReview: boolean;
  includeTesting: boolean;
}
