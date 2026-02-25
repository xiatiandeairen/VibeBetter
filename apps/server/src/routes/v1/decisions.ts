import { Hono } from 'hono';
import type { ApiResponse, DecisionItem } from '@vibebetter/shared';
import { prisma } from '@vibebetter/db';
import { authMiddleware } from '../../middleware/auth.js';
import { AppError } from '../../middleware/error-handler.js';
import { decisionService } from '../../services/decision.service.js';

const decisions = new Hono();

decisions.use('*', authMiddleware);

decisions.get('/projects/:id/decisions', async (c) => {
  const projectId = c.req.param('id');
  const { userId } = c.get('user');

  const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: userId } });
  if (!project) {
    throw AppError.notFound('Project not found');
  }

  const list = await decisionService.listDecisions(projectId);
  const data: DecisionItem[] = list.map((d) => ({
    id: d.id,
    level: d.level,
    category: d.category,
    title: d.title,
    description: d.description,
    priority: d.priority,
    status: d.status,
    createdAt: d.createdAt.toISOString(),
  }));

  return c.json<ApiResponse<DecisionItem[]>>({ success: true, data, error: null });
});

decisions.post('/projects/:id/decisions/generate', async (c) => {
  const projectId = c.req.param('id');
  const { userId } = c.get('user');

  const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: userId } });
  if (!project) {
    throw AppError.notFound('Project not found');
  }

  const generated = await decisionService.generateDecisions(projectId);
  const data: DecisionItem[] = generated.map((d) => ({
    id: d.id,
    level: d.level,
    category: d.category,
    title: d.title,
    description: d.description,
    priority: d.priority,
    status: d.status,
    createdAt: d.createdAt.toISOString(),
  }));

  return c.json<ApiResponse<DecisionItem[]>>({ success: true, data, error: null }, 201);
});

decisions.patch('/decisions/:id/status', async (c) => {
  const decisionId = c.req.param('id');
  const body = await c.req.json();

  const status = body.status as string | undefined;
  if (!status) {
    throw AppError.badRequest('Status is required');
  }

  const updated = await decisionService.updateDecisionStatus(decisionId, status);
  const data: DecisionItem = {
    id: updated.id,
    level: updated.level,
    category: updated.category,
    title: updated.title,
    description: updated.description,
    priority: updated.priority,
    status: updated.status,
    createdAt: updated.createdAt.toISOString(),
  };

  return c.json<ApiResponse<DecisionItem>>({ success: true, data, error: null });
});

export default decisions;
