import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '@vibebetter/db';
import { collectorRegistry } from '../collectors/base.js';
import { githubCollector } from '../collectors/github.collector.js';
import { localGitCollector } from '../collectors/local-git.collector.js';
import { env } from '../config/env.js';

collectorRegistry.register(githubCollector);
collectorRegistry.register(localGitCollector);

const connection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });

export const collectionQueue = new Queue('collection', { connection });

interface CollectionJobData {
  projectId: string;
}

export const collectionWorker = new Worker<CollectionJobData>(
  'collection',
  async (job) => {
    const { projectId } = job.data;

    const dbJob = await prisma.collectionJob.create({
      data: {
        projectId,
        source: 'GITHUB',
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    try {
      const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
      const collector = collectorRegistry.get(
        project.repoType === 'LOCAL' ? 'LOCAL_GIT' : project.repoType,
      );

      if (!collector) {
        throw new Error(`No collector registered for source: ${project.repoType}`);
      }

      await collector.initialize();
      const events = await collector.collect({ projectId });
      await collector.dispose();

      await prisma.collectionJob.update({
        where: { id: dbJob.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          itemsCount: events.length,
        },
      });
    } catch (err) {
      await prisma.collectionJob.update({
        where: { id: dbJob.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          error: err instanceof Error ? err.message : 'Unknown error',
        },
      });
      throw err;
    }
  },
  { connection },
);

collectionWorker.on('completed', (job) => {
  console.log(`Collection job ${job.id} completed for project ${job.data.projectId}`);
});

collectionWorker.on('failed', (job, err) => {
  console.error(`Collection job ${job?.id} failed:`, err.message);
});

export async function enqueueCollectionJob(projectId: string) {
  return collectionQueue.add('collect', { projectId }, { removeOnComplete: 100, removeOnFail: 50 });
}
