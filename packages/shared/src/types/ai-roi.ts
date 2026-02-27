export interface TimeMetrics {
  totalHoursSaved: number;
  avgHoursSavedPerPr: number;
  avgHoursSavedPerDev: number;
  timeToMergeReduction: number;
  reviewTimeReduction: number;
}

export interface CostBenefit {
  monthlyCost: number;
  monthlyTimeSaved: number;
  hourlyRate: number;
  moneySaved: number;
  netBenefit: number;
  breakEvenDays: number | null;
}

export interface ROICalculation {
  projectId: string;
  period: { from: Date; to: Date };
  totalPrs: number;
  aiAssistedPrs: number;
  timeMetrics: TimeMetrics;
  costBenefit: CostBenefit;
  roiPercent: number;
  confidence: 'high' | 'medium' | 'low';
  factors: ROIFactor[];
}

export interface ROIFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  magnitude: number;
  description: string;
}

export interface ROIConfig {
  hourlyRate: number;
  monthlyCostPerSeat: number;
  seatCount: number;
  avgHoursSavedPerAiPr: number;
  includeReviewTime: boolean;
}
