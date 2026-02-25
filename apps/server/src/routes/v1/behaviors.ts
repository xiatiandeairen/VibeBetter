import { Hono } from 'hono';
import { UserBehaviorSchema, AiBehaviorSchema } from '@vibebetter/shared';
import type { ApiResponse, UserBehaviorStats, AiBehaviorStats } from '@vibebetter/shared';
import { prisma } from '@vibebetter/db';
import { authMiddleware } from '../../middleware/auth.js';
import { AppError } from '../../middleware/error-handler.js';

const behaviors = new Hono();

behaviors.use('*', authMiddleware);

behaviors.post('/projects/:id/user-behaviors', async (c) => {
  const projectId = c.req.param('id');
  const { userId } = c.get('user');

  const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: userId } });
  if (!project) {
    throw AppError.notFound('Project not found');
  }

  const body = await c.req.json();
  const parsed = UserBehaviorSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(parsed.error.errors.map((e) => e.message).join(', '));
  }

  const behavior = await prisma.userBehavior.create({
    data: {
      projectId,
      userId,
      eventType: parsed.data.eventType,
      filePath: parsed.data.filePath,
      sessionDuration: parsed.data.sessionDuration,
      metadata: parsed.data.metadata ? JSON.parse(JSON.stringify(parsed.data.metadata)) as Record<string, string> : undefined,
    },
  });

  return c.json<ApiResponse<typeof behavior>>({ success: true, data: behavior, error: null }, 201);
});

behaviors.post('/projects/:id/ai-behaviors', async (c) => {
  const projectId = c.req.param('id');
  const { userId } = c.get('user');

  const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: userId } });
  if (!project) {
    throw AppError.notFound('Project not found');
  }

  const body = await c.req.json();
  const parsed = AiBehaviorSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(parsed.error.errors.map((e) => e.message).join(', '));
  }

  const behavior = await prisma.aiBehavior.create({
    data: {
      projectId,
      tool: parsed.data.tool,
      action: parsed.data.action,
      filePath: parsed.data.filePath,
      promptHash: parsed.data.promptHash,
      generationCount: parsed.data.generationCount,
      acceptedCount: parsed.data.acceptedCount,
      rejectedCount: parsed.data.rejectedCount,
      editDistance: parsed.data.editDistance,
      metadata: parsed.data.metadata ? JSON.parse(JSON.stringify(parsed.data.metadata)) as Record<string, string> : undefined,
    },
  });

  return c.json<ApiResponse<typeof behavior>>({ success: true, data: behavior, error: null }, 201);
});

behaviors.get('/projects/:id/user-behaviors/stats', async (c) => {
  const projectId = c.req.param('id');
  const { userId } = c.get('user');

  const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: userId } });
  if (!project) {
    throw AppError.notFound('Project not found');
  }

  const allBehaviors = await prisma.userBehavior.findMany({
    where: { projectId },
    select: { eventType: true, filePath: true, sessionDuration: true },
  });

  const totalEvents = allBehaviors.length;
  const uniqueFiles = new Set(allBehaviors.filter((b) => b.filePath).map((b) => b.filePath)).size;
  const sessionsWithDuration = allBehaviors.filter((b) => b.sessionDuration !== null);
  const avgSessionDuration =
    sessionsWithDuration.length > 0
      ? sessionsWithDuration.reduce((sum, b) => sum + (b.sessionDuration ?? 0), 0) /
        sessionsWithDuration.length
      : 0;

  const eventTypes: Record<string, number> = {};
  for (const b of allBehaviors) {
    eventTypes[b.eventType] = (eventTypes[b.eventType] ?? 0) + 1;
  }

  const stats: UserBehaviorStats = {
    totalEvents,
    uniqueFiles,
    avgSessionDuration,
    eventTypes,
  };

  return c.json<ApiResponse<UserBehaviorStats>>({ success: true, data: stats, error: null });
});

behaviors.get('/projects/:id/ai-behaviors/stats', async (c) => {
  const projectId = c.req.param('id');
  const { userId } = c.get('user');

  const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: userId } });
  if (!project) {
    throw AppError.notFound('Project not found');
  }

  const allBehaviors = await prisma.aiBehavior.findMany({
    where: { projectId },
    select: {
      tool: true,
      generationCount: true,
      acceptedCount: true,
      rejectedCount: true,
      editDistance: true,
    },
  });

  const totalGenerations = allBehaviors.reduce((sum, b) => sum + b.generationCount, 0);
  const totalAccepted = allBehaviors.reduce((sum, b) => sum + b.acceptedCount, 0);
  const acceptanceRate = totalGenerations > 0 ? totalAccepted / totalGenerations : 0;

  const behaviorsWithEditDistance = allBehaviors.filter((b) => b.editDistance !== null);
  const avgEditDistance =
    behaviorsWithEditDistance.length > 0
      ? behaviorsWithEditDistance.reduce((sum, b) => sum + (b.editDistance ?? 0), 0) /
        behaviorsWithEditDistance.length
      : 0;

  const toolUsage: Record<string, number> = {};
  for (const b of allBehaviors) {
    toolUsage[b.tool] = (toolUsage[b.tool] ?? 0) + 1;
  }

  const stats: AiBehaviorStats = {
    totalGenerations,
    totalAccepted,
    acceptanceRate,
    avgEditDistance,
    toolUsage,
  };

  return c.json<ApiResponse<AiBehaviorStats>>({ success: true, data: stats, error: null });
});

export default behaviors;
