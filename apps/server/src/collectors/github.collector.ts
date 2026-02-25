import type { DataSourceType, HealthStatus, CollectParams, NormalizedEvent } from '@vibebetter/shared';
import { isAiPr } from '@vibebetter/shared';
import { prisma } from '@vibebetter/db';
import type { IDataCollector } from './base.js';
import { env } from '../config/env.js';

interface GitHubPR {
  id: number;
  number: number;
  title: string;
  state: string;
  user: { login: string } | null;
  labels: Array<{ name: string }>;
  additions?: number;
  deletions?: number;
  changed_files?: number;
  commits?: number;
  review_comments?: number;
  merged_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export class GitHubCollector implements IDataCollector {
  readonly source: DataSourceType = 'GITHUB';
  readonly category = 'pull_requests';

  private baseUrl = 'https://api.github.com';

  private get headers(): Record<string, string> {
    const h: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'VibeBetter-Collector',
    };
    if (env.GITHUB_TOKEN) {
      h['Authorization'] = `Bearer ${env.GITHUB_TOKEN}`;
    }
    return h;
  }

  async initialize(): Promise<void> {
    // No-op; connection is stateless via fetch
  }

  async collect(params: CollectParams): Promise<NormalizedEvent[]> {
    const project = await prisma.project.findUniqueOrThrow({ where: { id: params.projectId } });
    const { owner, repo } = this.parseRepoUrl(project.repoUrl);

    const prs = await this.fetchPullRequests(owner, repo);
    const events: NormalizedEvent[] = [];

    for (const pr of prs) {
      const labels = pr.labels.map((l) => l.name);
      const commitMessages = await this.fetchCommitMessages(owner, repo, pr.number);
      const aiUsed = isAiPr(labels, commitMessages);

      await prisma.pullRequest.upsert({
        where: { projectId_externalId: { projectId: params.projectId, externalId: String(pr.id) } },
        create: {
          projectId: params.projectId,
          externalId: String(pr.id),
          number: pr.number,
          title: pr.title,
          state: pr.state,
          authorLogin: pr.user?.login ?? 'unknown',
          aiUsed,
          additions: pr.additions ?? 0,
          deletions: pr.deletions ?? 0,
          changedFiles: pr.changed_files ?? 0,
          commitCount: pr.commits ?? 0,
          reviewComments: pr.review_comments ?? 0,
          mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
          closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
        },
        update: {
          state: pr.state,
          aiUsed,
          additions: pr.additions ?? 0,
          deletions: pr.deletions ?? 0,
          changedFiles: pr.changed_files ?? 0,
          commitCount: pr.commits ?? 0,
          reviewComments: pr.review_comments ?? 0,
          mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
          closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
        },
      });

      events.push({
        source: 'GITHUB',
        type: 'pull_request',
        payload: { prNumber: pr.number, title: pr.title, aiUsed },
        timestamp: new Date(pr.created_at),
      });
    }

    return events;
  }

  async healthCheck(): Promise<HealthStatus> {
    try {
      const res = await fetch(`${this.baseUrl}/rate_limit`, { headers: this.headers });
      return { healthy: res.ok, message: res.ok ? 'GitHub API reachable' : `Status ${res.status}` };
    } catch (err) {
      return { healthy: false, message: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  async dispose(): Promise<void> {
    // No-op
  }

  private parseRepoUrl(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
    if (!match?.[1] || !match[2]) throw new Error(`Invalid GitHub repo URL: ${url}`);
    return { owner: match[1], repo: match[2] };
  }

  private async fetchPullRequests(owner: string, repo: string): Promise<GitHubPR[]> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/pulls?state=all&per_page=100`;
    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    return (await res.json()) as GitHubPR[];
  }

  private async fetchCommitMessages(owner: string, repo: string, prNumber: number): Promise<string[]> {
    try {
      const url = `${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}/commits?per_page=100`;
      const res = await fetch(url, { headers: this.headers });
      if (!res.ok) return [];
      const commits = (await res.json()) as Array<{ commit: { message: string } }>;
      return commits.map((c) => c.commit.message);
    } catch {
      return [];
    }
  }
}

export const githubCollector = new GitHubCollector();
