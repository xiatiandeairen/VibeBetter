export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  meta?: { page?: number; total?: number; limit?: number };
  error: string | null;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: string;
}

export type DataSourceType = 'GITHUB' | 'GITLAB' | 'LOCAL_GIT' | 'JIRA' | 'SONARQUBE';
export type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface NormalizedEvent {
  source: DataSourceType;
  type: string;
  payload: Record<string, unknown>;
  timestamp: Date;
  meta?: Record<string, unknown>;
}

export interface HealthStatus {
  healthy: boolean;
  message?: string;
}

export interface CollectParams {
  projectId: string;
  since?: Date;
  until?: Date;
}

export interface MetricResult {
  aiSuccessRate: number | null;
  aiStableRate: number | null;
  totalPrs: number;
  aiPrs: number;
  psriScore: number | null;
  psriStructural: number | null;
  psriChange: number | null;
  psriDefect: number | null;
  avgComplexity: number | null;
  tdiScore: number | null;
  totalFiles: number;
  hotspotFiles: number;
}

export interface DecisionItem {
  id: string;
  level: string;
  category: string;
  title: string;
  description: string;
  priority: number;
  status: string;
  createdAt: string;
}

export interface WeightConfigData {
  structural: number;
  change: number;
  defect: number;
  architecture: number;
  runtime: number;
  coverage: number;
}

export interface UserBehaviorStats {
  totalEvents: number;
  uniqueFiles: number;
  avgSessionDuration: number;
  eventTypes: Record<string, number>;
}

export interface AiBehaviorStats {
  totalGenerations: number;
  totalAccepted: number;
  acceptanceRate: number;
  avgEditDistance: number;
  toolUsage: Record<string, number>;
}

export * from './dashboard';
export * from './insight';
export * from './rules';
export * from './subscription';
export * from './billing';
export * from './audit';
export * from './organization';
export * from './webhook-config';
export * from './notification';
export * from './export';
export * from './api-analytics';
export * from './partner';
export * from './license';
export * from './entitlements';
export * from './invoice';
export * from './onboarding-flow';
export * from './support';
export * from './changelog-config';
export * from './marketplace-plugin';
export * from './team-health';
export * from './ai-roi';
export * from './pair-programming';
export * from './tech-radar';
export * from './code-ownership';
export * from './burndown';
export * from './adoption-metrics';
export * from './mentorship';
export * from './complexity-history';
export * from './release-readiness';
