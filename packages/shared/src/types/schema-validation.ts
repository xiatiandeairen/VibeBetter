export interface SchemaIssue {
  table: string;
  column: string;
  issue: 'missing-index' | 'nullable-risk' | 'type-mismatch' | 'orphan-fk' | 'naming-convention' | 'missing-constraint';
  severity: 'high' | 'medium' | 'low';
  suggestion: string;
}

export interface SchemaValidationReport {
  id: string;
  projectId: string;
  generatedAt: Date;
  issues: SchemaIssue[];
  totalTables: number;
  totalIssues: number;
  highSeverityCount: number;
}

export interface SchemaValidationConfig {
  namingConvention: 'snake_case' | 'camelCase';
  checkIndexes: boolean;
  checkForeignKeys: boolean;
  checkNullability: boolean;
  excludeTables: string[];
}
