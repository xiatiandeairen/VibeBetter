export interface AccuracyScore {
  category: string;
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface PredictionResult {
  id: string;
  category: string;
  predicted: string | number | boolean;
  actual: string | number | boolean;
  correct: boolean;
  confidence: number;
  timestamp: Date;
  context: Record<string, unknown>;
}

export interface ConfidenceInterval {
  mean: number;
  lower: number;
  upper: number;
  confidenceLevel: number;
  sampleSize: number;
}

export interface AccuracyReport {
  projectId: string;
  period: { from: Date; to: Date };
  overallAccuracy: number;
  categoryScores: AccuracyScore[];
  confidenceInterval: ConfidenceInterval;
  trend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
  calibrationScore: number;
}

export interface AccuracyConfig {
  categories: string[];
  minSampleSize: number;
  confidenceLevel: number;
  trackingEnabled: boolean;
  reportFrequency: 'daily' | 'weekly' | 'monthly';
}
