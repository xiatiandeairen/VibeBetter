export interface CommitScore {
  hash: string;
  message: string;
  author: string;
  date: Date;
  overallScore: number;
  messageScore: number;
  sizeScore: number;
  scopeScore: number;
  issues: CommitIssue[];
}

export interface CommitIssue {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string | null;
}

export interface MessageAnalysis {
  hasConventionalPrefix: boolean;
  prefix: string | null;
  hasScope: boolean;
  scope: string | null;
  subjectLength: number;
  hasBody: boolean;
  bodyLength: number;
  hasBreakingChange: boolean;
  references: string[];
}

export interface ConventionCompliance {
  projectId: string;
  period: { from: Date; to: Date };
  totalCommits: number;
  conventionalCount: number;
  complianceRate: number;
  avgScore: number;
  topIssues: { rule: string; count: number }[];
  trendDirection: 'improving' | 'stable' | 'declining';
}
