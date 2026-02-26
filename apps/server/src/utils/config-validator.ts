import { logger } from './logger.js';

export interface ConfigRule {
  key: string;
  required: boolean;
  validate?: (value: string) => boolean;
  hint: string;
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const CONFIG_RULES: ConfigRule[] = [
  {
    key: 'DATABASE_URL',
    required: true,
    validate: (v) => v.startsWith('postgres'),
    hint: 'Must be a PostgreSQL connection string, e.g. postgresql://user:pass@host:5432/db',
  },
  {
    key: 'REDIS_URL',
    required: false,
    validate: (v) => v.startsWith('redis'),
    hint: 'Must be a Redis connection string, e.g. redis://localhost:6379',
  },
  {
    key: 'PORT',
    required: false,
    validate: (v) => { const n = parseInt(v, 10); return !isNaN(n) && n >= 1 && n <= 65535; },
    hint: 'Must be a valid port number (1-65535)',
  },
  {
    key: 'JWT_SECRET',
    required: true,
    validate: (v) => v.length >= 16,
    hint: 'Must be at least 16 characters for security',
  },
  {
    key: 'NODE_ENV',
    required: false,
    validate: (v) => ['development', 'production', 'test'].includes(v),
    hint: 'Should be one of: development, production, test',
  },
  {
    key: 'CORS_ORIGINS',
    required: false,
    validate: (v) => v.split(',').every((o) => o.startsWith('http')),
    hint: 'Comma-separated list of URLs, e.g. http://localhost:3000,https://app.example.com',
  },
  {
    key: 'LOG_LEVEL',
    required: false,
    validate: (v) => ['trace', 'debug', 'info', 'warn', 'error', 'fatal'].includes(v),
    hint: 'Should be one of: trace, debug, info, warn, error, fatal',
  },
];

export function validateConfig(rules: ConfigRule[] = CONFIG_RULES): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const rule of rules) {
    const value = process.env[rule.key];

    if (!value) {
      if (rule.required) {
        errors.push(`Missing required config: ${rule.key} — ${rule.hint}`);
      } else {
        warnings.push(`Optional config not set: ${rule.key} — ${rule.hint}`);
      }
      continue;
    }

    if (rule.validate && !rule.validate(value)) {
      errors.push(`Invalid value for ${rule.key}: ${rule.hint}`);
    }
  }

  const valid = errors.length === 0;

  if (!valid) {
    logger.error({ errorCount: errors.length }, 'Configuration validation failed');
    for (const e of errors) logger.error(e);
  } else {
    logger.info({ warnings: warnings.length }, 'Configuration validation passed');
  }

  for (const w of warnings) logger.warn(w);

  return { valid, errors, warnings };
}
