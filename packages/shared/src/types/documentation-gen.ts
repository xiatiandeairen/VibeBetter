export interface DocGenTarget {
  file: string;
  functions: number;
  documented: number;
  generated: number;
  coverage: number;
  language: string;
}

export interface DocGenReport {
  id: string;
  projectId: string;
  generatedAt: Date;
  targets: DocGenTarget[];
  totalFunctions: number;
  totalGenerated: number;
  overallCoverage: number;
}

export interface DocGenConfig {
  style: 'jsdoc' | 'tsdoc' | 'markdown';
  includeExamples: boolean;
  includeParams: boolean;
  includeReturns: boolean;
  excludePatterns: string[];
  outputDir: string;
}
