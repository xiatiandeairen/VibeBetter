export interface AIPattern {
  id: string;
  name: string;
  description: string;
  category: 'generation' | 'refactoring' | 'testing' | 'documentation' | 'debugging';
  detectedAt: Date;
  frequency: PatternFrequency;
  impact: PatternImpact;
  examples: PatternExample[];
}

export interface PatternFrequency {
  occurrences: number;
  period: 'daily' | 'weekly' | 'monthly';
  trend: 'increasing' | 'decreasing' | 'stable';
  firstSeen: Date;
  lastSeen: Date;
}

export interface PatternImpact {
  type: 'positive' | 'neutral' | 'negative';
  score: number;
  affectedFiles: number;
  affectedModules: string[];
  qualityDelta: number;
  velocityDelta: number;
}

export interface PatternExample {
  file: string;
  line: number;
  snippet: string;
  prId?: string;
  timestamp: Date;
}

export interface PatternDetectionConfig {
  minOccurrences: number;
  lookbackDays: number;
  categories: string[];
  excludePatterns: string[];
  confidenceThreshold: number;
}
