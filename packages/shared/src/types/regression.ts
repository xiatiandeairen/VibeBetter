export interface RegressionTest {
  testId: string;
  name: string;
  suite: string;
  status: 'pass' | 'fail' | 'flaky' | 'regression' | 'new-failure';
  duration: number;
  previousStatus: 'pass' | 'fail';
  errorMessage?: string;
}

export interface RegressionReport {
  id: string;
  projectId: string;
  generatedAt: Date;
  tests: RegressionTest[];
  totalTests: number;
  regressionCount: number;
  flakyCount: number;
  passRate: number;
}

export interface RegressionConfig {
  baselineBranch: string;
  flakyThreshold: number;
  lookbackRuns: number;
  excludeSuites: string[];
  notifyOnRegression: boolean;
}
