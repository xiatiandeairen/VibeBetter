import type { CreateProjectInput, UpdateProjectInput } from '@vibebetter/shared';
import { prisma } from '@vibebetter/db';
import type { Project } from '@vibebetter/db';
import { AppError } from '../middleware/error-handler.js';

export class ProjectService {
  async list(userId: string): Promise<Project[]> {
    return prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, input: CreateProjectInput): Promise<Project> {
    return prisma.project.create({
      data: { ...input, ownerId: userId },
    });
  }

  async getById(userId: string, projectId: string): Promise<Project> {
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });
    if (!project) {
      throw AppError.notFound('Project not found');
    }
    return project;
  }

  async update(userId: string, projectId: string, input: UpdateProjectInput): Promise<Project> {
    const existing = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });
    if (!existing) {
      throw AppError.notFound('Project not found');
    }
    return prisma.project.update({
      where: { id: projectId },
      data: input,
    });
  }

  async delete(userId: string, projectId: string): Promise<void> {
    const existing = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });
    if (!existing) {
      throw AppError.notFound('Project not found');
    }
    await prisma.project.delete({ where: { id: projectId } });
  }
}

export const projectService = new ProjectService();
