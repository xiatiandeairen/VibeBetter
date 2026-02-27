export interface DocCoverageResult {
  file: string;
  hasJSDoc: boolean;
  hasReadme: boolean;
  exportedSymbols: number;
  documentedSymbols: number;
  coverage: number;
  issues: DocIssue[];
}

export interface DocIssue {
  line: number;
  symbol: string;
  kind: 'missing-jsdoc' | 'missing-param' | 'missing-return' | 'outdated' | 'empty-doc';
  message: string;
}

export interface DocReport {
  id: string;
  projectId: string;
  generatedAt: Date;
  results: DocCoverageResult[];
  avgCoverage: number;
  totalIssues: number;
  filesWithoutDocs: number;
}

export interface DocConfig {
  requireJSDoc: boolean;
  requireReadme: boolean;
  minCoverage: number;
  excludePatterns: string[];
  enforceParamDocs: boolean;
}
