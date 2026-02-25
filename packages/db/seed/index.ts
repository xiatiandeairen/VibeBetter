import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

async function main(): Promise<void> {
  const rand = seededRandom(42);
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

  const prTitles = [
    { title: 'feat: add dashboard overview page', ai: true, major: false, rollback: false },
    { title: 'feat: implement PSRI calculation engine', ai: true, major: false, rollback: false },
    { title: 'fix: correct metric snapshot ordering', ai: false, major: false, rollback: false },
    { title: 'feat: add GitHub PR data collector', ai: true, major: true, rollback: false },
    { title: 'refactor: extract service layer from routes', ai: true, major: false, rollback: false },
    { title: 'feat: implement decision recommendation engine', ai: true, major: false, rollback: false },
    { title: 'fix: resolve auth middleware token validation', ai: false, major: false, rollback: false },
    { title: 'feat: add risk trends visualization', ai: true, major: false, rollback: true },
    { title: 'chore: update dependencies and fix lint errors', ai: false, major: false, rollback: false },
    { title: 'feat: implement AI behavior tracking API', ai: true, major: false, rollback: false },
    { title: 'feat: add local git collector for file metrics', ai: true, major: true, rollback: false },
    { title: 'fix: handle empty project state gracefully', ai: true, major: false, rollback: false },
    { title: 'feat: implement weight configuration API', ai: true, major: false, rollback: false },
    { title: 'refactor: improve error handling with AppError', ai: false, major: false, rollback: false },
    { title: 'feat: add user behavior event tracking', ai: true, major: false, rollback: false },
    { title: 'fix: resolve ECharts rendering in dark mode', ai: true, major: false, rollback: true },
    { title: 'feat: implement TDI calculation', ai: true, major: false, rollback: false },
    { title: 'feat: add project CRUD with validation', ai: true, major: false, rollback: false },
    { title: 'chore: setup Docker Compose for dev environment', ai: false, major: false, rollback: false },
    { title: 'feat: add metric snapshot history API', ai: true, major: false, rollback: false },
    { title: 'feat: redesign landing page with dark theme', ai: true, major: true, rollback: false },
    { title: 'fix: correct PSRI weight normalization', ai: true, major: false, rollback: false },
    { title: 'feat: add hotspot file detection', ai: true, major: false, rollback: false },
    { title: 'feat: implement collection job queue', ai: false, major: false, rollback: false },
    { title: 'feat: add AI insights dashboard page', ai: true, major: false, rollback: false },
  ];

  const now = new Date();
  for (let i = 0; i < prTitles.length; i++) {
    const pr = prTitles[i]!;
    const createdDate = new Date(now);
    createdDate.setDate(createdDate.getDate() - (prTitles.length - i) * 2);

    await prisma.pullRequest.upsert({
      where: { projectId_externalId: { projectId: project.id, externalId: `pr-${i + 1}` } },
      update: {},
      create: {
        projectId: project.id,
        externalId: `pr-${i + 1}`,
        number: i + 1,
        title: pr.title,
        state: 'closed',
        authorLogin: i % 3 === 0 ? 'dev-alice' : i % 3 === 1 ? 'dev-bob' : 'ai-assistant',
        aiUsed: pr.ai,
        additions: Math.floor(rand() * 200 + 10),
        deletions: Math.floor(rand() * 80 + 5),
        changedFiles: Math.floor(rand() * 8 + 1),
        commitCount: Math.floor(rand() * 5 + 1),
        reviewComments: Math.floor(rand() * 10),
        mergedAt: createdDate,
        closedAt: createdDate,
        rollbackFlag: pr.rollback,
        majorRevision: pr.major,
        createdAt: createdDate,
      },
    });
  }
  console.log(`Seeded ${prTitles.length} pull requests`);

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const r = rand;

    await prisma.metricSnapshot.create({
      data: {
        projectId: project.id,
        snapshotDate: date,
        aiSuccessRate: 0.72 + r() * 0.2,
        aiStableRate: 0.82 + r() * 0.15,
        totalPrs: Math.floor(15 + r() * 15),
        aiPrs: Math.floor(8 + r() * 10),
        psriScore: 0.25 + r() * 0.3,
        psriStructural: 0.15 + r() * 0.25,
        psriChange: 0.1 + r() * 0.25,
        psriDefect: 0.05 + r() * 0.15,
        tdiScore: 0.3 + r() * 0.4,
        avgComplexity: 8 + r() * 12,
        totalFiles: Math.floor(60 + r() * 40),
        hotspotFiles: Math.floor(3 + r() * 7),
      },
    });
  }
  console.log('Seeded 31 metric snapshots');

  const realFiles = [
    { path: 'apps/server/src/services/metrics.service.ts', cc: 22, loc: 220, freq: 18, authors: 2 },
    { path: 'apps/server/src/collectors/github.collector.ts', cc: 18, loc: 210, freq: 15, authors: 2 },
    { path: 'apps/server/src/routes/v1/metrics.ts', cc: 14, loc: 145, freq: 12, authors: 3 },
    { path: 'apps/server/src/services/decision.service.ts', cc: 16, loc: 126, freq: 10, authors: 1 },
    { path: 'apps/web/src/app/(dashboard)/dashboard/page.tsx', cc: 12, loc: 236, freq: 14, authors: 2 },
    { path: 'apps/server/src/index.ts', cc: 6, loc: 43, freq: 8, authors: 2 },
    { path: 'apps/server/src/middleware/error-handler.ts', cc: 10, loc: 84, freq: 5, authors: 1 },
    { path: 'apps/web/src/lib/api.ts', cc: 4, loc: 284, freq: 16, authors: 2 },
    { path: 'packages/shared/src/schemas/index.ts', cc: 3, loc: 74, freq: 9, authors: 1 },
    { path: 'apps/server/src/jobs/scheduler.ts', cc: 8, loc: 81, freq: 7, authors: 1 },
    { path: 'apps/web/src/app/(dashboard)/dashboard/decisions/page.tsx', cc: 8, loc: 141, freq: 4, authors: 1 },
    { path: 'apps/web/src/app/(dashboard)/dashboard/insights/page.tsx', cc: 6, loc: 188, freq: 3, authors: 1 },
  ];

  for (const f of realFiles) {
    await prisma.fileMetric.upsert({
      where: { projectId_filePath: { projectId: project.id, filePath: f.path } },
      update: { cyclomaticComplexity: f.cc, linesOfCode: f.loc, changeFrequency90d: f.freq, authorCount: f.authors },
      create: {
        projectId: project.id,
        filePath: f.path,
        cyclomaticComplexity: f.cc,
        linesOfCode: f.loc,
        changeFrequency90d: f.freq,
        authorCount: f.authors,
        aiCodeRatio: rand() * 0.6,
        lastModified: new Date(),
      },
    });
  }
  console.log(`Seeded ${realFiles.length} file metrics`);

  const tools = ['cursor', 'copilot', 'codewhisperer'];
  for (const tool of tools) {
    for (let i = 0; i < 5; i++) {
      const gen = Math.floor(rand() * 10 + 2);
      const accepted = Math.floor(gen * (0.6 + rand() * 0.35));
      await prisma.aiBehavior.create({
        data: {
          projectId: project.id,
          tool,
          action: 'code_generation',
          filePath: realFiles[Math.floor(rand() * realFiles.length)]?.path,
          generationCount: gen,
          acceptedCount: accepted,
          rejectedCount: gen - accepted,
          editDistance: rand() * 0.4 + 0.05,
        },
      });
    }
  }
  console.log('Seeded 15 AI behavior records');

  const eventTypes = ['file_edit', 'code_review', 'debug_session', 'terminal_command', 'ai_prompt'];
  for (const eventType of eventTypes) {
    for (let i = 0; i < 3; i++) {
      await prisma.userBehavior.create({
        data: {
          projectId: project.id,
          userId: user.id,
          eventType,
          filePath: realFiles[Math.floor(rand() * realFiles.length)]?.path,
          sessionDuration: Math.floor(rand() * 5400 + 300),
        },
      });
    }
  }
  console.log('Seeded 15 user behavior records');
}

main()
  .then(() => {
    console.log('Seed completed successfully');
    return prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
