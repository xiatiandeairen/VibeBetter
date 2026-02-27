export interface ModuleMetrics {
  moduleId: string;
  name: string;
  fileCount: number;
  totalLines: number;
  avgComplexity: number;
  maxComplexity: number;
  testCoverage: number;
  churnRate: number;
  riskScore: number;
  contributors: string[];
  lastModified: Date;
}

export interface ModuleBoundary {
  moduleId: string;
  allowedDependencies: string[];
  forbiddenDependencies: string[];
  publicExports: string[];
  violations: BoundaryViolation[];
}

export interface BoundaryViolation {
  sourceModule: string;
  targetModule: string;
  importPath: string;
  violationType: 'forbidden-import' | 'circular' | 'layer-violation';
  severity: 'error' | 'warning';
}

export interface ModuleHealth {
  moduleId: string;
  healthScore: number;
  dimensions: {
    complexity: number;
    coverage: number;
    churn: number;
    coupling: number;
    cohesion: number;
  };
  trend: 'improving' | 'stable' | 'degrading';
  recommendations: string[];
}
