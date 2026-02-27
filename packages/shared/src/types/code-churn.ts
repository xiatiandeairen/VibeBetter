export interface ChurnRate {
  filePath: string;
  period: { from: Date; to: Date };
  additions: number;
  deletions: number;
  commits: number;
  uniqueAuthors: number;
  churnRatio: number;
  isHighChurn: boolean;
}

export interface ChurnPattern {
  patternType: 'rewrite' | 'oscillation' | 'growth' | 'decay' | 'stable';
  filePath: string;
  occurrences: number;
  firstSeen: Date;
  lastSeen: Date;
  description: string;
  suggestedAction: string | null;
}

export interface StabilityIndex {
  filePath: string;
  stabilityScore: number;
  daysSinceLastChange: number;
  avgDaysBetweenChanges: number;
  changeFrequency: 'very-high' | 'high' | 'medium' | 'low' | 'very-low';
  isStable: boolean;
}

export interface ChurnAnalysis {
  projectId: string;
  period: { from: Date; to: Date };
  totalFilesAnalyzed: number;
  highChurnFiles: ChurnRate[];
  patterns: ChurnPattern[];
  stabilityDistribution: Record<string, number>;
  avgChurnRate: number;
}
