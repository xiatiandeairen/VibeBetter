import simpleGit from 'simple-git';
import type { DataSourceType, HealthStatus, CollectParams, NormalizedEvent } from '@vibebetter/shared';
import { prisma } from '@vibebetter/db';
import type { IDataCollector } from './base.js';

export class LocalGitCollector implements IDataCollector {
  readonly source: DataSourceType = 'LOCAL_GIT';
  readonly category = 'file_metrics';

  async initialize(): Promise<void> {
    // No-op
  }

  async collect(params: CollectParams): Promise<NormalizedEvent[]> {
    const project = await prisma.project.findUniqueOrThrow({ where: { id: params.projectId } });
    const repoPath = project.repoUrl;

    const git = simpleGit(repoPath);
    const events: NormalizedEvent[] = [];

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const log = await git.log({
      '--since': ninetyDaysAgo.toISOString(),
      '--name-only': null,
      '--pretty': 'format:%H|%an|%aI',
    });

    const fileStats = new Map<string, { changeCount: number; authors: Set<string>; lastModified: Date }>();

    for (const commit of log.all) {
      const authorName = commit.author_name;
      const commitDate = new Date(commit.date);
      const diff = commit.diff;

      if (diff?.files) {
        for (const file of diff.files) {
          const filePath = file.file;
          const existing = fileStats.get(filePath);
          if (existing) {
            existing.changeCount++;
            existing.authors.add(authorName);
            if (commitDate > existing.lastModified) {
              existing.lastModified = commitDate;
            }
          } else {
            fileStats.set(filePath, {
              changeCount: 1,
              authors: new Set([authorName]),
              lastModified: commitDate,
            });
          }
        }
      }
    }

    for (const [filePath, stats] of fileStats) {
      await prisma.fileMetric.upsert({
        where: { projectId_filePath: { projectId: params.projectId, filePath } },
        create: {
          projectId: params.projectId,
          filePath,
          changeFrequency90d: stats.changeCount,
          authorCount: stats.authors.size,
          lastModified: stats.lastModified,
        },
        update: {
          changeFrequency90d: stats.changeCount,
          authorCount: stats.authors.size,
          lastModified: stats.lastModified,
        },
      });

      events.push({
        source: 'LOCAL_GIT',
        type: 'file_metric',
        payload: {
          filePath,
          changeFrequency: stats.changeCount,
          authorCount: stats.authors.size,
        },
        timestamp: stats.lastModified,
      });
    }

    return events;
  }

  async healthCheck(): Promise<HealthStatus> {
    try {
      const git = simpleGit();
      const version = await git.version();
      return { healthy: true, message: `git ${version.installed ? 'installed' : 'not found'}` };
    } catch (err) {
      return { healthy: false, message: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  async dispose(): Promise<void> {
    // No-op
  }
}

export const localGitCollector = new LocalGitCollector();
