import { logger } from './logger.js';

interface EnvVarSpec {
  name: string;
  required: boolean;
  description: string;
  defaultValue?: string;
  validator?: (value: string) => boolean;
}

const ENV_SPECS: EnvVarSpec[] = [
  { name: 'DATABASE_URL', required: true, description: 'PostgreSQL connection string', validator: (v) => v.startsWith('postgres') },
  { name: 'REDIS_URL', required: true, description: 'Redis connection string', validator: (v) => v.startsWith('redis') },
  { name: 'JWT_SECRET', required: true, description: 'Secret key for JWT signing (min 32 chars)', validator: (v) => v.length >= 32 },
  { name: 'PORT', required: false, description: 'Server port', defaultValue: '3001', validator: (v) => !isNaN(Number(v)) && Number(v) > 0 },
  { name: 'NODE_ENV', required: false, description: 'Environment mode', defaultValue: 'development', validator: (v) => ['development', 'production', 'test'].includes(v) },
  { name: 'GITHUB_CLIENT_ID', required: false, description: 'GitHub OAuth client ID' },
  { name: 'GITHUB_CLIENT_SECRET', required: false, description: 'GitHub OAuth client secret' },
  { name: 'CORS_ORIGINS', required: false, description: 'Comma-separated allowed origins', defaultValue: 'http://localhost:3000' },
  { name: 'LOG_LEVEL', required: false, description: 'Pino log level', defaultValue: 'info', validator: (v) => ['trace', 'debug', 'info', 'warn', 'error', 'fatal'].includes(v) },
];

export interface EnvCheckResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function checkEnvironment(specs: EnvVarSpec[] = ENV_SPECS): EnvCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const spec of specs) {
    const value = process.env[spec.name];

    if (!value && spec.required) {
      errors.push(`Missing required env var: ${spec.name} — ${spec.description}`);
      continue;
    }

    if (!value && !spec.required) {
      if (spec.defaultValue) {
        warnings.push(`${spec.name} not set, using default: ${spec.defaultValue}`);
      }
      continue;
    }

    if (value && spec.validator && !spec.validator(value)) {
      errors.push(`Invalid value for ${spec.name} — ${spec.description}`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateEnvironmentOrExit(): void {
  const result = checkEnvironment();

  for (const w of result.warnings) {
    logger.warn(w);
  }

  if (!result.valid) {
    logger.error('Environment validation failed:');
    for (const e of result.errors) {
      logger.error(`  ✗ ${e}`);
    }
    logger.error('Fix the above issues and restart the server.');
    process.exit(1);
  }

  logger.info(`Environment check passed (${result.warnings.length} warning(s))`);
}
