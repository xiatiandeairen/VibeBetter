import { prisma } from '@vibebetter/db';
import type { Project } from '@vibebetter/db';
import { AppError } from './error-handler.js';
import type { Context, Next } from 'hono';

declare module 'hono' {
  interface ContextVariableMap {
    project: Project;
  }
}

export function requireProject() {
  return async (c: Context, next: Next) => {
    const projectId = c.req.param('id');
    if (!projectId) {
      throw new AppError('Project ID is required', 400, 'MISSING_PROJECT_ID');
    }

    const { userId } = c.get('user') as { userId: string };
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });

    if (!project) {
      throw new AppError('Project not found or access denied', 404, 'PROJECT_NOT_FOUND');
    }

    c.set('project', project);
    await next();
  };
}
