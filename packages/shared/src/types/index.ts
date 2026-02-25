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
  totalFiles: number;
  hotspotFiles: number;
}
