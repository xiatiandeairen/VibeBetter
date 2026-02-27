export interface ComplexityPoint {
  date: Date;
  avgComplexity: number;
  maxComplexity: number;
  medianComplexity: number;
  totalFiles: number;
  filesAboveThreshold: number;
  p90Complexity: number;
}

export interface ComplexityTrend {
  projectId: string;
  period: { from: Date; to: Date };
  points: ComplexityPoint[];
  direction: 'improving' | 'stable' | 'worsening';
  changeRate: number;
  hotspots: ComplexityHotspot[];
  summary: {
    startAvg: number;
    endAvg: number;
    deltaPercent: number;
    peakComplexity: number;
    peakDate: Date;
  };
}

export interface ComplexityHotspot {
  filePath: string;
  currentComplexity: number;
  previousComplexity: number;
  changeFrequency: number;
  lastModified: Date;
  contributors: number;
  risk: 'critical' | 'high' | 'medium' | 'low';
}

export interface ComplexityConfig {
  threshold: number;
  granularity: 'daily' | 'weekly' | 'monthly';
  includeTests: boolean;
  filePatterns: string[];
  excludePatterns: string[];
}
