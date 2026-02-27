export interface OptimizationSuggestion {
  id: string;
  area: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  estimatedGain: string;
  category: 'performance' | 'bundle' | 'database' | 'network' | 'memory' | 'build';
}

export interface OptimizationReport {
  id: string;
  projectId: string;
  generatedAt: Date;
  suggestions: OptimizationSuggestion[];
  totalSuggestions: number;
  highImpactCount: number;
  estimatedOverallGain: string;
}

export interface OptimizationConfig {
  categories: string[];
  minImpact: 'high' | 'medium' | 'low';
  maxEffort: 'high' | 'medium' | 'low';
  excludeAreas: string[];
  autoApply: boolean;
}
