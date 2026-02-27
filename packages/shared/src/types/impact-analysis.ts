export interface ImpactNode {
  file: string;
  directDependents: number;
  transitiveDependents: number;
  riskScore: number;
  blastRadius: 'low' | 'medium' | 'high' | 'critical';
  lastModified: Date;
}

export interface ImpactAnalysisReport {
  id: string;
  projectId: string;
  generatedAt: Date;
  nodes: ImpactNode[];
  totalFiles: number;
  criticalCount: number;
  avgRiskScore: number;
}

export interface ImpactAnalysisConfig {
  maxDepth: number;
  includeTests: boolean;
  excludePatterns: string[];
  riskThreshold: number;
  blastRadiusWeights: Record<string, number>;
}
