export interface TestPriority {
  file: string;
  risk: number;
  churnScore: number;
  lastFailedAt: Date | null;
  failCount: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface TestPriorityConfig {
  riskWeight: number;
  churnWeight: number;
  failureWeight: number;
  maxAge: number;
  topN: number;
}

export interface TestPriorityReport {
  id: string;
  projectId: string;
  generatedAt: Date;
  tests: TestPriority[];
  totalTests: number;
  criticalCount: number;
  avgRisk: number;
}
