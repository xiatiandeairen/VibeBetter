import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(500).optional(),
  repoUrl: z.string().url('Invalid repository URL'),
  repoType: z.enum(['GITHUB', 'GITLAB', 'LOCAL']).default('GITHUB'),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  repoUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

export const MetricsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const WeightConfigSchema = z.object({
  structural: z.number().min(0).max(1),
  change: z.number().min(0).max(1),
  defect: z.number().min(0).max(1),
  architecture: z.number().min(0).max(1),
  runtime: z.number().min(0).max(1),
  coverage: z.number().min(0).max(1),
});

export const UserBehaviorSchema = z.object({
  eventType: z.string().min(1),
  filePath: z.string().optional(),
  sessionDuration: z.number().int().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const AiBehaviorSchema = z.object({
  tool: z.string().min(1),
  action: z.string().min(1),
  filePath: z.string().optional(),
  promptHash: z.string().optional(),
  generationCount: z.number().int().default(0),
  acceptedCount: z.number().int().default(0),
  rejectedCount: z.number().int().default(0),
  editDistance: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type MetricsQueryInput = z.infer<typeof MetricsQuerySchema>;
export type WeightConfigInput = z.infer<typeof WeightConfigSchema>;
export type UserBehaviorInput = z.infer<typeof UserBehaviorSchema>;
export type AiBehaviorInput = z.infer<typeof AiBehaviorSchema>;
