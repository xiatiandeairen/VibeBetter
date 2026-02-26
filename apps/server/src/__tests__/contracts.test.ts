import { describe, it, expect } from 'vitest';
import {
  RegisterSchema,
  LoginSchema,
  CreateProjectSchema,
  UpdateProjectSchema,
  MetricsQuerySchema,
  WeightConfigSchema,
  AiBehaviorSchema,
  UserBehaviorSchema,
  getBenchmarkLevel,
} from '@vibebetter/shared';

describe('API Response Contracts', () => {
  describe('Auth endpoints', () => {
    it('RegisterSchema requires email, name, password', () => {
      const valid = RegisterSchema.safeParse({
        email: 'user@example.com',
        name: 'User',
        password: 'securepass',
      });
      expect(valid.success).toBe(true);

      const missingEmail = RegisterSchema.safeParse({ name: 'User', password: 'securepass' });
      expect(missingEmail.success).toBe(false);

      const missingName = RegisterSchema.safeParse({ email: 'user@example.com', password: 'securepass' });
      expect(missingName.success).toBe(false);

      const missingPassword = RegisterSchema.safeParse({ email: 'user@example.com', name: 'User' });
      expect(missingPassword.success).toBe(false);
    });

    it('LoginSchema requires email, password', () => {
      const valid = LoginSchema.safeParse({ email: 'user@example.com', password: 'pass123' });
      expect(valid.success).toBe(true);

      const missingEmail = LoginSchema.safeParse({ password: 'pass123' });
      expect(missingEmail.success).toBe(false);

      const missingPassword = LoginSchema.safeParse({ email: 'user@example.com' });
      expect(missingPassword.success).toBe(false);
    });
  });

  describe('Project endpoints', () => {
    it('CreateProjectSchema requires name, repoUrl', () => {
      const valid = CreateProjectSchema.safeParse({
        name: 'Test Project',
        repoUrl: 'https://github.com/org/repo',
      });
      expect(valid.success).toBe(true);

      const missingName = CreateProjectSchema.safeParse({ repoUrl: 'https://github.com/org/repo' });
      expect(missingName.success).toBe(false);

      const missingUrl = CreateProjectSchema.safeParse({ name: 'Test' });
      expect(missingUrl.success).toBe(false);
    });

    it('UpdateProjectSchema allows partial updates', () => {
      const nameOnly = UpdateProjectSchema.safeParse({ name: 'New Name' });
      expect(nameOnly.success).toBe(true);

      const empty = UpdateProjectSchema.safeParse({});
      expect(empty.success).toBe(true);

      const activeOnly = UpdateProjectSchema.safeParse({ isActive: false });
      expect(activeOnly.success).toBe(true);
    });
  });

  describe('Metrics schemas', () => {
    it('MetricsQuerySchema defaults limit to 30', () => {
      const result = MetricsQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(30);
      }
    });

    it('MetricsQuerySchema accepts valid date range', () => {
      const result = MetricsQuerySchema.safeParse({
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-02-01T00:00:00.000Z',
        limit: 50,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.from).toBe('2026-01-01T00:00:00.000Z');
        expect(result.data.to).toBe('2026-02-01T00:00:00.000Z');
        expect(result.data.limit).toBe(50);
      }
    });

    it('MetricsQuerySchema rejects limit above 100', () => {
      const result = MetricsQuerySchema.safeParse({ limit: 101 });
      expect(result.success).toBe(false);
    });

    it('MetricsQuerySchema rejects limit below 1', () => {
      const result = MetricsQuerySchema.safeParse({ limit: 0 });
      expect(result.success).toBe(false);
    });
  });

  describe('Weight schemas', () => {
    it('WeightConfigSchema accepts valid weights', () => {
      const result = WeightConfigSchema.safeParse({
        structural: 0.2,
        change: 0.2,
        defect: 0.2,
        architecture: 0.15,
        runtime: 0.1,
        coverage: 0.15,
      });
      expect(result.success).toBe(true);
    });

    it('WeightConfigSchema rejects values > 1', () => {
      const result = WeightConfigSchema.safeParse({
        structural: 1.5,
        change: 0.2,
        defect: 0.2,
        architecture: 0.15,
        runtime: 0.1,
        coverage: 0.15,
      });
      expect(result.success).toBe(false);
    });

    it('WeightConfigSchema rejects negative values', () => {
      const result = WeightConfigSchema.safeParse({
        structural: -0.1,
        change: 0.2,
        defect: 0.2,
        architecture: 0.15,
        runtime: 0.1,
        coverage: 0.15,
      });
      expect(result.success).toBe(false);
    });

    it('WeightConfigSchema requires all six fields', () => {
      const result = WeightConfigSchema.safeParse({
        structural: 0.2,
        change: 0.2,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Behavior schemas', () => {
    it('AiBehaviorSchema requires tool and action', () => {
      const valid = AiBehaviorSchema.safeParse({ tool: 'cursor', action: 'code_gen' });
      expect(valid.success).toBe(true);

      const missingTool = AiBehaviorSchema.safeParse({ action: 'code_gen' });
      expect(missingTool.success).toBe(false);

      const missingAction = AiBehaviorSchema.safeParse({ tool: 'cursor' });
      expect(missingAction.success).toBe(false);
    });

    it('AiBehaviorSchema defaults counts to 0', () => {
      const result = AiBehaviorSchema.safeParse({ tool: 'cursor', action: 'code_gen' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.generationCount).toBe(0);
        expect(result.data.acceptedCount).toBe(0);
        expect(result.data.rejectedCount).toBe(0);
      }
    });

    it('UserBehaviorSchema requires eventType', () => {
      const valid = UserBehaviorSchema.safeParse({ eventType: 'file_edit' });
      expect(valid.success).toBe(true);

      const missing = UserBehaviorSchema.safeParse({});
      expect(missing.success).toBe(false);

      const empty = UserBehaviorSchema.safeParse({ eventType: '' });
      expect(empty.success).toBe(false);
    });

    it('UserBehaviorSchema accepts optional fields', () => {
      const result = UserBehaviorSchema.safeParse({
        eventType: 'file_edit',
        filePath: '/src/app.ts',
        sessionDuration: 3600,
        metadata: { editor: 'vscode' },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Benchmark utility', () => {
    it('getBenchmarkLevel returns correct levels for aiSuccessRate', () => {
      expect(getBenchmarkLevel('aiSuccessRate', 0.96)).toBe('Excellent');
      expect(getBenchmarkLevel('aiSuccessRate', 0.88)).toBe('Good');
      expect(getBenchmarkLevel('aiSuccessRate', 0.72)).toBe('Average');
      expect(getBenchmarkLevel('aiSuccessRate', 0.4)).toBe('Poor');
    });

    it('getBenchmarkLevel returns correct levels for psriScore (inverted)', () => {
      expect(getBenchmarkLevel('psriScore', 0.1)).toBe('Excellent');
      expect(getBenchmarkLevel('psriScore', 0.25)).toBe('Good');
      expect(getBenchmarkLevel('psriScore', 0.45)).toBe('Average');
      expect(getBenchmarkLevel('psriScore', 0.75)).toBe('Poor');
    });

    it('getBenchmarkLevel returns correct levels for tdiScore (inverted)', () => {
      expect(getBenchmarkLevel('tdiScore', 0.15)).toBe('Excellent');
      expect(getBenchmarkLevel('tdiScore', 0.35)).toBe('Good');
      expect(getBenchmarkLevel('tdiScore', 0.55)).toBe('Average');
      expect(getBenchmarkLevel('tdiScore', 0.85)).toBe('Poor');
    });

    it('getBenchmarkLevel returns correct levels for aiStableRate', () => {
      expect(getBenchmarkLevel('aiStableRate', 0.98)).toBe('Excellent');
      expect(getBenchmarkLevel('aiStableRate', 0.92)).toBe('Good');
      expect(getBenchmarkLevel('aiStableRate', 0.82)).toBe('Average');
      expect(getBenchmarkLevel('aiStableRate', 0.5)).toBe('Poor');
    });
  });
});
