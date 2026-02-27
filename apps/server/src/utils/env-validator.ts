import { logger } from './logger.js';

export interface EnvSpec {
  name: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'url';
  defaultValue?: string;
}

export interface EnvCheckResult {
  name: string;
  present: boolean;
  valid: boolean;
  required: boolean;
  error?: string;
}

export function validateEnvironment(specs: EnvSpec[], env: Record<string, string | undefined>): EnvCheckResult[] {
  if (specs.length === 0) {
    logger.warn('No environment specs provided for validation');
    return [];
  }

  const results: EnvCheckResult[] = [];

  for (const spec of specs) {
    const value = env[spec.name];
    const present = value !== undefined && value !== '';

    if (!present) {
      results.push({ name: spec.name, present: false, valid: !spec.required, required: spec.required, error: spec.required ? 'Required variable missing' : undefined });
      continue;
    }

    let valid = true;
    let error: string | undefined;

    switch (spec.type) {
      case 'number':
        if (isNaN(Number(value))) { valid = false; error = 'Expected a number'; }
        break;
      case 'boolean':
        if (!['true', 'false', '1', '0'].includes(value!.toLowerCase())) { valid = false; error = 'Expected true/false'; }
        break;
      case 'url':
        try { new URL(value!); } catch { valid = false; error = 'Invalid URL format'; }
        break;
    }

    results.push({ name: spec.name, present, valid, required: spec.required, error });
  }

  const missing = results.filter(r => r.required && !r.present);
  logger.info({ total: specs.length, missing: missing.length, invalid: results.filter(r => !r.valid).length }, 'Environment validation complete');
  return results;
}
