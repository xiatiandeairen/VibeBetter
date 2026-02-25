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
    return apiFetch<MetricsOverviewResponse>(`/api/v1/projects/${projectId}/metrics/overview`);
  },

  getMetricSnapshots(projectId: string, limit = 30) {
    return apiFetch<MetricSnapshotsResponse>(
      `/api/v1/projects/${projectId}/metrics/snapshots?limit=${limit}`,
    );
  },

  getTopFiles(projectId: string, limit = 10) {
    return apiFetch<TopFilesResponse>(
      `/api/v1/projects/${projectId}/metrics/top-files?limit=${limit}`,
    );
  },

  triggerCollection(projectId: string) {
    return apiFetch<{ success: boolean; data: CollectionJobItem }>(
      `/api/v1/projects/${projectId}/collect`,
      { method: 'POST' },
    );
  },

  getCollectionJobs(projectId: string) {
    return apiFetch<CollectionJobsResponse>(`/api/v1/projects/${projectId}/collection-jobs`);
  },

  triggerCompute(projectId: string) {
    return apiFetch<{ success: boolean }>(`/api/v1/projects/${projectId}/compute`, {
      method: 'POST',
    });
  },
};
