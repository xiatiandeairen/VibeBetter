import { Hono } from 'hono';
import { CreateProjectSchema, UpdateProjectSchema } from '@vibebetter/shared';
import type { ApiResponse } from '@vibebetter/shared';
import { authMiddleware } from '../../middleware/auth.js';
import { projectService } from '../../services/project.service.js';
import { AppError } from '../../middleware/error-handler.js';
import { enqueueCollectionJob } from '../../jobs/scheduler.js';
import { logger } from '../../utils/logger.js';

const projects = new Hono();

projects.use('*', authMiddleware);

projects.get('/', async (c) => {
  const { userId } = c.get('user');
  const list = await projectService.list(userId);
  return c.json<ApiResponse<typeof list>>({ success: true, data: list, error: null });
});

projects.post('/', async (c) => {
  const { userId } = c.get('user');
  const body = await c.req.json();
  const parsed = CreateProjectSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(parsed.error.errors.map((e) => e.message).join(', '));
  }

  const project = await projectService.create(userId, parsed.data);
  enqueueCollectionJob(project.id).catch((err) => {
    logger.error({ err }, 'Failed to enqueue first collection job');
  });
  return c.json<ApiResponse<typeof project>>({ success: true, data: project, error: null }, 201);
});

projects.get('/:id', async (c) => {
  const { userId } = c.get('user');
  const id = c.req.param('id');
  const project = await projectService.getById(userId, id);
  return c.json<ApiResponse<typeof project>>({ success: true, data: project, error: null });
});

projects.patch('/:id', async (c) => {
  const { userId } = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = UpdateProjectSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(parsed.error.errors.map((e) => e.message).join(', '));
  }

  const updated = await projectService.update(userId, id, parsed.data);
  return c.json<ApiResponse<typeof updated>>({ success: true, data: updated, error: null });
});

projects.delete('/:id', async (c) => {
  const { userId } = c.get('user');
  const id = c.req.param('id');
  await projectService.delete(userId, id);
  return c.json<ApiResponse<{ deleted: boolean }>>({
    success: true,
    data: { deleted: true },
    error: null,
  });
});

export default projects;
