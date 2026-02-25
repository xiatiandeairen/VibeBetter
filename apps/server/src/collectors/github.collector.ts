import type {
  DataSourceType,
  HealthStatus,
  CollectParams,
  NormalizedEvent,
} from '@vibebetter/shared';
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

    const prs = await this.fetchAllPullRequests(owner, repo, params.since);
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

  private async fetchAllPullRequests(
    owner: string,
    repo: string,
    since?: Date,
  ): Promise<GitHubPR[]> {
    const allPrs: GitHubPR[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      let url = `${this.baseUrl}/repos/${owner}/${repo}/pulls?state=all&per_page=${perPage}&page=${page}&sort=updated&direction=desc`;
      if (since) {
        url += `&since=${since.toISOString()}`;
      }

      const res = await fetch(url, { headers: this.headers });

      await this.checkRateLimit(res);

      if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);

      const prs = (await res.json()) as GitHubPR[];
      if (prs.length === 0) break;

      if (since) {
        const filtered = prs.filter((pr) => new Date(pr.updated_at) >= since);
        allPrs.push(...filtered);
        if (filtered.length < prs.length) break;
      } else {
        allPrs.push(...prs);
      }

      const nextUrl = this.getNextPageUrl(res.headers.get('link'));
      if (!nextUrl) break;

      page++;
    }

    return allPrs;
  }

  private getNextPageUrl(linkHeader: string | null): string | null {
    if (!linkHeader) return null;

    const parts = linkHeader.split(',');
    for (const part of parts) {
      const match = part.match(/<([^>]+)>;\s*rel="next"/);
      if (match?.[1]) return match[1];
    }
    return null;
  }

  private async checkRateLimit(res: Response): Promise<void> {
    const remaining = res.headers.get('x-ratelimit-remaining');
    const resetTime = res.headers.get('x-ratelimit-reset');

    if (remaining !== null && parseInt(remaining, 10) <= 5 && resetTime) {
      const resetMs = parseInt(resetTime, 10) * 1000;
      const now = Date.now();
      const waitMs = Math.max(resetMs - now + 1000, 0);

      if (waitMs > 0 && waitMs < 300000) {
        console.log(`GitHub rate limit low (${remaining} remaining). Pausing for ${Math.ceil(waitMs / 1000)}s`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
  }

  private async fetchCommitMessages(
    owner: string,
    repo: string,
    prNumber: number,
  ): Promise<string[]> {
    try {
      const url = `${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}/commits?per_page=100`;
      const res = await fetch(url, { headers: this.headers });

      await this.checkRateLimit(res);

      if (!res.ok) return [];
      const commits = (await res.json()) as Array<{ commit: { message: string } }>;
      return commits.map((c) => c.commit.message);
    } catch {
      return [];
    }
  }
}

export const githubCollector = new GitHubCollector();
