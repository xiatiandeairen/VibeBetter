import type { VibeConfig } from './config.js';

export class ApiClient {
  constructor(private config: VibeConfig) {}

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.apiUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
        ...options.headers,
      },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error((body as Record<string, string>).error || `API error: ${res.status}`);
    }
    const json = await res.json();
    return (json as { data: T }).data;
  }

  async getOverview() {
    return this.request<{
      aiSuccessRate: number | null;
      aiStableRate: number | null;
      psriScore: number | null;
      tdiScore: number | null;
      totalPrs: number;
      aiPrs: number;
      totalFiles: number;
      hotspotFiles: number;
      avgComplexity: number | null;
    }>(`/api/v1/metrics/projects/${this.config.projectId}/overview`);
  }

  async getTopFiles(limit = 10, sort = 'default') {
    return this.request<Array<{
      filePath: string;
      cyclomaticComplexity: number;
      changeFrequency90d: number;
      linesOfCode: number;
      authorCount: number;
      aiCodeRatio: number | null;
      riskScore: number;
    }>>(`/api/v1/metrics/projects/${this.config.projectId}/files/top?limit=${limit}&sort=${sort}`);
  }

  async getDecisions() {
    return this.request<Array<{
      id: string;
      level: string;
      category: string;
      title: string;
      description: string;
      status: string;
    }>>(`/api/v1/decisions/projects/${this.config.projectId}/decisions`);
  }

  async generateDecisions() {
    return this.request<Array<{ id: string; level: string; title: string; description: string }>>(
      `/api/v1/decisions/projects/${this.config.projectId}/decisions/generate`,
      { method: 'POST' },
    );
  }

  async updateDecisionStatus(decisionId: string, status: string) {
    return this.request(`/api/v1/decisions/decisions/${decisionId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getAiStats() {
    return this.request<{
      totalGenerations: number;
      totalAccepted: number;
      acceptanceRate: number;
      avgEditDistance: number;
      toolUsage: Record<string, number>;
    }>(`/api/v1/behaviors/projects/${this.config.projectId}/ai-behaviors/stats`);
  }

  async getAttribution() {
    return this.request<{
      summary: { aiFileCount: number; humanFileCount: number; aiPrCount: number; humanPrCount: number };
      complexity: { aiAvg: number; humanAvg: number; verdict: string };
      quality: { aiMajorRevisionRate: number; humanMajorRevisionRate: number; aiRollbackRate: number; humanRollbackRate: number };
    }>(`/api/v1/metrics/projects/${this.config.projectId}/attribution`);
  }

  async getSnapshots(limit = 5) {
    return this.request<Array<{
      snapshotDate: string;
      aiSuccessRate: number | null;
      aiStableRate: number | null;
      psriScore: number | null;
      tdiScore: number | null;
    }>>(`/api/v1/metrics/projects/${this.config.projectId}/snapshots?limit=${limit}`);
  }

  async triggerCollection() {
    return this.request(`/api/v1/collectors/projects/${this.config.projectId}/collect`, { method: 'POST' });
  }

  async triggerCompute() {
    return this.request(`/api/v1/metrics/projects/${this.config.projectId}/compute`, { method: 'POST' });
  }

  async getDigest() {
    return this.request<{
      period: { from: string; to: string };
      metrics: {
        aiSuccessRate: number | null;
        aiStableRate: number | null;
        psriScore: number | null;
        tdiScore: number | null;
      };
      trends: { psriChange: number; tdiChange: number };
      activity: { prsThisWeek: number; aiPrsThisWeek: number };
      snapshotCount: number;
    }>(`/api/v1/metrics/projects/${this.config.projectId}/digest`);
  }

  async healthCheck() {
    const res = await fetch(`${this.config.apiUrl}/health`);
    return res.ok;
  }
}
