import { Hono } from 'hono';
import { CreateProjectSchema, UpdateProjectSchema } from '@vibebetter/shared';
import type { ApiResponse } from '@vibebetter/shared';
import { prisma } from '@vibebetter/db';
import { authMiddleware } from '../../middleware/auth.js';

const projects = new Hono();

projects.use('*', authMiddleware);

projects.get('/', async (c) => {
  try {
    const { userId } = c.get('user');
    const list = await prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });
    return c.json<ApiResponse<typeof list>>({ success: true, data: list, error: null });
  } catch (err) {
    console.error('List projects error:', err);
    return c.json<ApiResponse>({ success: false, data: null, error: 'Internal server error' }, 500);
  }
});

projects.post('/', async (c) => {
  try {
    const { userId } = c.get('user');
    const body = await c.req.json();
    const parsed = CreateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return c.json<ApiResponse>(
        { success: false, data: null, error: parsed.error.errors.map((e) => e.message).join(', ') },
        400,
      );
    }

    const project = await prisma.project.create({
      data: { ...parsed.data, ownerId: userId },
    });
    return c.json<ApiResponse<typeof project>>({ success: true, data: project, error: null }, 201);
  } catch (err) {
    console.error('Create project error:', err);
    return c.json<ApiResponse>({ success: false, data: null, error: 'Internal server error' }, 500);
  }
});

projects.get('/:id', async (c) => {
  try {
    const { userId } = c.get('user');
    const id = c.req.param('id');
    const project = await prisma.project.findFirst({
      where: { id, ownerId: userId },
    });
    if (!project) {
      return c.json<ApiResponse>({ success: false, data: null, error: 'Project not found' }, 404);
    }
    return c.json<ApiResponse<typeof project>>({ success: true, data: project, error: null });
  } catch (err) {
    console.error('Get project error:', err);
    return c.json<ApiResponse>({ success: false, data: null, error: 'Internal server error' }, 500);
  }
});

projects.patch('/:id', async (c) => {
  try {
    const { userId } = c.get('user');
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = UpdateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return c.json<ApiResponse>(
        { success: false, data: null, error: parsed.error.errors.map((e) => e.message).join(', ') },
        400,
      );
    }

    const existing = await prisma.project.findFirst({ where: { id, ownerId: userId } });
    if (!existing) {
      return c.json<ApiResponse>({ success: false, data: null, error: 'Project not found' }, 404);
    }

    const updated = await prisma.project.update({
      where: { id },
      data: parsed.data,
    });
    return c.json<ApiResponse<typeof updated>>({ success: true, data: updated, error: null });
  } catch (err) {
    console.error('Update project error:', err);
    return c.json<ApiResponse>({ success: false, data: null, error: 'Internal server error' }, 500);
  }
});

projects.delete('/:id', async (c) => {
  try {
    const { userId } = c.get('user');
    const id = c.req.param('id');

    const existing = await prisma.project.findFirst({ where: { id, ownerId: userId } });
    if (!existing) {
      return c.json<ApiResponse>({ success: false, data: null, error: 'Project not found' }, 404);
    }

    await prisma.project.delete({ where: { id } });
    return c.json<ApiResponse<{ deleted: boolean }>>({ success: true, data: { deleted: true }, error: null });
  } catch (err) {
    console.error('Delete project error:', err);
    return c.json<ApiResponse>({ success: false, data: null, error: 'Internal server error' }, 500);
  }
});

export default projects;
