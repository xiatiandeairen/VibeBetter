import { describe, it, expect } from 'vitest';
import { CreateProjectSchema, UpdateProjectSchema } from '@vibebetter/shared';

describe('Project Service - Schema Validation', () => {
  describe('CreateProjectSchema', () => {
    it('accepts valid input with name and repoUrl', () => {
      const result = CreateProjectSchema.safeParse({
        name: 'My Project',
        repoUrl: 'https://github.com/org/repo',
      });
      expect(result.success).toBe(true);
    });

    it('defaults repoType to GITHUB', () => {
      const result = CreateProjectSchema.safeParse({
        name: 'My Project',
        repoUrl: 'https://github.com/org/repo',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.repoType).toBe('GITHUB');
      }
    });

    it('accepts optional description', () => {
      const result = CreateProjectSchema.safeParse({
        name: 'My Project',
        repoUrl: 'https://github.com/org/repo',
        description: 'A test project',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing name', () => {
      const result = CreateProjectSchema.safeParse({
        repoUrl: 'https://github.com/org/repo',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty name', () => {
      const result = CreateProjectSchema.safeParse({
        name: '',
        repoUrl: 'https://github.com/org/repo',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid repoUrl', () => {
      const result = CreateProjectSchema.safeParse({
        name: 'My Project',
        repoUrl: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing repoUrl', () => {
      const result = CreateProjectSchema.safeParse({
        name: 'My Project',
      });
      expect(result.success).toBe(false);
    });

    it('accepts valid repoType enum values', () => {
      for (const repoType of ['GITHUB', 'GITLAB', 'LOCAL']) {
        const result = CreateProjectSchema.safeParse({
          name: 'Test',
          repoUrl: 'https://github.com/org/repo',
          repoType,
        });
        expect(result.success).toBe(true);
      }
    });

    it('rejects name exceeding 100 characters', () => {
      const result = CreateProjectSchema.safeParse({
        name: 'a'.repeat(101),
        repoUrl: 'https://github.com/org/repo',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateProjectSchema', () => {
    it('allows partial updates with name only', () => {
      const result = UpdateProjectSchema.safeParse({ name: 'New Name' });
      expect(result.success).toBe(true);
    });

    it('allows partial updates with description only', () => {
      const result = UpdateProjectSchema.safeParse({ description: 'Updated desc' });
      expect(result.success).toBe(true);
    });

    it('allows partial updates with isActive only', () => {
      const result = UpdateProjectSchema.safeParse({ isActive: false });
      expect(result.success).toBe(true);
    });

    it('allows empty object (all fields optional)', () => {
      const result = UpdateProjectSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('rejects invalid repoUrl', () => {
      const result = UpdateProjectSchema.safeParse({ repoUrl: 'not-valid' });
      expect(result.success).toBe(false);
    });

    it('rejects empty name', () => {
      const result = UpdateProjectSchema.safeParse({ name: '' });
      expect(result.success).toBe(false);
    });
  });
});
