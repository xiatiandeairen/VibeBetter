import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const password = await hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@vibebetter.dev' },
    update: {},
    create: {
      email: 'demo@vibebetter.dev',
      name: 'Demo User',
      password,
      role: 'ADMIN',
    },
  });

  console.log('Seeded user:', user.email);

  const project = await prisma.project.upsert({
    where: { id: 'seed-project-1' },
    update: {},
    create: {
      id: 'seed-project-1',
      name: 'VibeBetter',
      description: 'AI Coding Insight Platform',
      repoUrl: 'https://github.com/xiatiandeairen/VibeBetter',
      repoType: 'GITHUB',
      ownerId: user.id,
    },
  });

  console.log('Seeded project:', project.name);

  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    await prisma.metricSnapshot.create({
      data: {
        projectId: project.id,
        snapshotDate: date,
        aiSuccessRate: 0.7 + Math.random() * 0.25,
        aiStableRate: 0.8 + Math.random() * 0.18,
        totalPrs: Math.floor(10 + Math.random() * 20),
        aiPrs: Math.floor(5 + Math.random() * 10),
        psriScore: 0.2 + Math.random() * 0.4,
        psriStructural: 0.1 + Math.random() * 0.3,
        psriChange: 0.1 + Math.random() * 0.3,
        psriDefect: 0.1 + Math.random() * 0.3,
        avgComplexity: 5 + Math.random() * 15,
        totalFiles: Math.floor(50 + Math.random() * 100),
        hotspotFiles: Math.floor(2 + Math.random() * 8),
      },
    });
  }

  console.log('Seeded 31 metric snapshots');

  const files = [
    'src/index.ts',
    'src/services/metrics.service.ts',
    'src/collectors/github.collector.ts',
    'src/engines/risk.engine.ts',
    'src/routes/v1/auth.ts',
    'src/middleware/auth.ts',
    'src/config/env.ts',
    'src/jobs/scheduler.ts',
    'src/utils/helpers.ts',
    'src/collectors/local-git.collector.ts',
  ];

  for (const filePath of files) {
    await prisma.fileMetric.upsert({
      where: {
        projectId_filePath: { projectId: project.id, filePath },
      },
      update: {},
      create: {
        projectId: project.id,
        filePath,
        cyclomaticComplexity: Math.floor(3 + Math.random() * 25),
        linesOfCode: Math.floor(30 + Math.random() * 300),
        changeFrequency90d: Math.floor(1 + Math.random() * 20),
        authorCount: Math.floor(1 + Math.random() * 5),
        aiCodeRatio: Math.random() * 0.8,
        lastModified: new Date(),
      },
    });
  }

  console.log('Seeded 10 file metrics');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
