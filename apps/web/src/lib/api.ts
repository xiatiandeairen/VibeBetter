const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export interface AuthResponse {
  success: boolean;
  data: { token: string; user: { id: string; email: string; name: string; role: string } };
}

export interface ProjectResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    description: string | null;
    repoUrl: string;
    repoType: string;
    isActive: boolean;
    createdAt: string;
  };
}

export interface ProjectsListResponse {
  success: boolean;
  data: ProjectResponse['data'][];
}

export interface MetricsOverviewResponse {
  success: boolean;
  data: {
    aiSuccessRate: number | null;
    aiStableRate: number | null;
    totalPrs: number;
    aiPrs: number;
    psriScore: number | null;
    psriStructural: number | null;
    psriChange: number | null;
    psriDefect: number | null;
    tdiScore: number | null;
    avgComplexity: number | null;
    totalFiles: number;
    hotspotFiles: number;
  };
}

export interface MetricSnapshotItem {
  id: string;
  snapshotDate: string;
  aiSuccessRate: number | null;
  aiStableRate: number | null;
  psriScore: number | null;
  psriStructural: number | null;
  psriChange: number | null;
  psriDefect: number | null;
  tdiScore: number | null;
  totalFiles: number;
}

export interface MetricSnapshotsResponse {
  success: boolean;
  data: MetricSnapshotItem[];
}

export interface TopFile {
  filePath: string;
  cyclomaticComplexity: number;
  changeFrequency90d: number;
  linesOfCode: number;
  authorCount: number;
  aiCodeRatio: number | null;
}

export interface TopFilesResponse {
  success: boolean;
  data: TopFile[];
}

export interface CollectionJobItem {
  id: string;
  source: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  itemsCount: number;
  createdAt: string;
}

export interface CollectionJobsResponse {
  success: boolean;
  data: CollectionJobItem[];
}

export interface UserResponse {
  success: boolean;
  data: { id: string; email: string; name: string; role: string };
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

export interface DecisionsResponse {
  success: boolean;
  data: DecisionItem[];
}

export interface WeightConfigData {
  structural: number;
  change: number;
  defect: number;
  architecture: number;
  runtime: number;
  coverage: number;
}

export interface WeightsResponse {
  success: boolean;
  data: WeightConfigData;
}

export interface AiBehaviorStats {
  totalGenerations: number;
  totalAccepted: number;
  acceptanceRate: number;
  avgEditDistance: number;
  toolUsage: Record<string, number>;
}

export interface AiBehaviorStatsResponse {
  success: boolean;
  data: AiBehaviorStats;
}

export interface UserBehaviorStats {
  totalEvents: number;
  uniqueFiles: number;
  avgSessionDuration: number;
  eventTypes: Record<string, number>;
}

export interface UserBehaviorStatsResponse {
  success: boolean;
  data: UserBehaviorStats;
}

export const api = {
  register(data: { name: string; email: string; password: string }) {
    return apiFetch<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login(data: { email: string; password: string }) {
    return apiFetch<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMe() {
    return apiFetch<UserResponse>('/api/v1/auth/me');
  },

  getProjects() {
    return apiFetch<ProjectsListResponse>('/api/v1/projects');
  },

  createProject(data: { name: string; description?: string; repoUrl: string; repoType?: string }) {
    return apiFetch<ProjectResponse>('/api/v1/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getProject(id: string) {
    return apiFetch<ProjectResponse>(`/api/v1/projects/${id}`);
  },

  deleteProject(id: string) {
    return apiFetch<{ success: boolean }>(`/api/v1/projects/${id}`, { method: 'DELETE' });
  },

  getMetricsOverview(projectId: string) {
    return apiFetch<MetricsOverviewResponse>(
      `/api/v1/metrics/projects/${projectId}/overview`,
    );
  },

  getMetricSnapshots(projectId: string, limit = 30) {
    return apiFetch<MetricSnapshotsResponse>(
      `/api/v1/metrics/projects/${projectId}/snapshots?limit=${limit}`,
    );
  },

  getTopFiles(projectId: string, limit = 10) {
    return apiFetch<TopFilesResponse>(
      `/api/v1/metrics/projects/${projectId}/files/top?limit=${limit}`,
    );
  },

  triggerCollection(projectId: string) {
    return apiFetch<{ success: boolean; data: CollectionJobItem }>(
      `/api/v1/collectors/projects/${projectId}/collect`,
      { method: 'POST' },
    );
  },

  getCollectionJobs(projectId: string) {
    return apiFetch<CollectionJobsResponse>(
      `/api/v1/collectors/projects/${projectId}/jobs`,
    );
  },

  triggerCompute(projectId: string) {
    return apiFetch<{ success: boolean }>(
      `/api/v1/metrics/projects/${projectId}/compute`,
      { method: 'POST' },
    );
  },

  getDecisions(projectId: string) {
    return apiFetch<DecisionsResponse>(
      `/api/v1/decisions/projects/${projectId}/decisions`,
    );
  },

  generateDecisions(projectId: string) {
    return apiFetch<DecisionsResponse>(
      `/api/v1/decisions/projects/${projectId}/decisions/generate`,
      { method: 'POST' },
    );
  },

  updateDecisionStatus(decisionId: string, status: string) {
    return apiFetch<{ success: boolean }>(
      `/api/v1/decisions/decisions/${decisionId}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
    );
  },

  getWeights(projectId: string) {
    return apiFetch<WeightsResponse>(
      `/api/v1/weights/projects/${projectId}/weights`,
    );
  },

  updateWeights(projectId: string, weights: WeightConfigData) {
    return apiFetch<WeightsResponse>(
      `/api/v1/weights/projects/${projectId}/weights`,
      { method: 'PUT', body: JSON.stringify(weights) },
    );
  },

  getAiBehaviorStats(projectId: string) {
    return apiFetch<AiBehaviorStatsResponse>(
      `/api/v1/behaviors/projects/${projectId}/ai-behaviors/stats`,
    );
  },

  getUserBehaviorStats(projectId: string) {
    return apiFetch<UserBehaviorStatsResponse>(
      `/api/v1/behaviors/projects/${projectId}/user-behaviors/stats`,
    );
  },

  getRecentPrs(projectId: string, limit = 5) {
    return apiFetch<{
      success: boolean;
      data: Array<{
        id: string;
        number: number;
        title: string;
        aiUsed: boolean;
        state: string;
        createdAt: string;
      }>;
    }>(`/api/v1/metrics/projects/${projectId}/recent-prs?limit=${limit}`);
  },

  getAllPrs(projectId: string) {
    return apiFetch<{
      success: boolean;
      data: Array<{
        id: string;
        number: number;
        title: string;
        authorLogin: string;
        aiUsed: boolean;
        state: string;
        additions: number;
        deletions: number;
        changedFiles: number;
        commitCount: number;
        reviewComments: number;
        rollbackFlag: boolean;
        majorRevision: boolean;
        mergedAt: string | null;
        createdAt: string;
      }>;
    }>(`/api/v1/metrics/projects/${projectId}/prs`);
  },

  getAttribution(projectId: string) {
    return apiFetch<{ success: boolean; data: Record<string, unknown> }>(
      `/api/v1/metrics/projects/${projectId}/attribution`,
    );
  },

  getFailedPrs(projectId: string) {
    return apiFetch<{ success: boolean; data: Record<string, unknown> }>(
      `/api/v1/metrics/projects/${projectId}/failed-prs`,
    );
  },

  getDevelopers(projectId: string) {
    return apiFetch<{
      success: boolean;
      data: Array<{
        login: string;
        totalPrs: number;
        aiPrs: number;
        aiUsageRate: number;
        mergeRate: number;
        rollbackRate: number;
      }>;
    }>(`/api/v1/metrics/projects/${projectId}/developers`);
  },

  getDimensionFiles(projectId: string, dimension: string) {
    return apiFetch<TopFilesResponse>(
      `/api/v1/metrics/projects/${projectId}/files/top?limit=20&sort=${dimension}`,
    );
  },

  exportMetrics(projectId: string, format = 'json') {
    return apiFetch<{ success: boolean; data: MetricSnapshotItem[] }>(
      `/api/v1/metrics/projects/${projectId}/export?format=${format}`,
    );
  },
};
