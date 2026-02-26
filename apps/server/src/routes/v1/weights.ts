import { Hono } from 'hono';
import { WeightConfigSchema, PSRI_DEFAULT_WEIGHTS } from '@vibebetter/shared';
import type { ApiResponse, WeightConfigData } from '@vibebetter/shared';
import { prisma } from '@vibebetter/db';
import { authMiddleware } from '../../middleware/auth.js';
import { requireProject } from '../../middleware/require-project.js';
import { AppError } from '../../middleware/error-handler.js';

const weights = new Hono();

weights.use('*', authMiddleware);

weights.get('/projects/:id/weights', requireProject(), async (c) => {
  const project = c.get('project');

  const config = await prisma.weightConfig.findUnique({ where: { projectId: project.id } });

  const data: WeightConfigData = config
    ? {
        structural: config.structural,
        change: config.change,
        defect: config.defect,
        architecture: config.architecture,
        runtime: config.runtime,
        coverage: config.coverage,
      }
    : {
        structural: PSRI_DEFAULT_WEIGHTS.structural,
        change: PSRI_DEFAULT_WEIGHTS.change,
        defect: PSRI_DEFAULT_WEIGHTS.defect,
        architecture: PSRI_DEFAULT_WEIGHTS.architecture,
        runtime: PSRI_DEFAULT_WEIGHTS.runtime,
        coverage: PSRI_DEFAULT_WEIGHTS.coverage,
      };

  return c.json<ApiResponse<WeightConfigData>>({ success: true, data, error: null });
});

weights.put('/projects/:id/weights', requireProject(), async (c) => {
  const project = c.get('project');

  const body = await c.req.json();
  const parsed = WeightConfigSchema.safeParse(body);
  if (!parsed.success) {
    throw AppError.badRequest(parsed.error.errors.map((e) => e.message).join(', '));
  }

  const config = await prisma.weightConfig.upsert({
    where: { projectId: project.id },
    create: { projectId: project.id, ...parsed.data },
    update: parsed.data,
  });

  const data: WeightConfigData = {
    structural: config.structural,
    change: config.change,
    defect: config.defect,
    architecture: config.architecture,
    runtime: config.runtime,
    coverage: config.coverage,
  };

  return c.json<ApiResponse<WeightConfigData>>({ success: true, data, error: null });
});

export default weights;
