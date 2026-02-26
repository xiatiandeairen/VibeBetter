import { logger } from './logger.js';

export type CheckStatus = 'pass' | 'fail' | 'warn';

export interface StartupCheckResult {
  name: string;
  status: CheckStatus;
  message: string;
  durationMs: number;
}

export interface StartupReport {
  allPassed: boolean;
  results: StartupCheckResult[];
  totalDurationMs: number;
  timestamp: Date;
}

type CheckFn = () => Promise<{ status: CheckStatus; message: string }>;

async function runCheck(name: string, fn: CheckFn): Promise<StartupCheckResult> {
  const start = Date.now();
  try {
    const { status, message } = await fn();
    return { name, status, message, durationMs: Date.now() - start };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { name, status: 'fail', message: msg, durationMs: Date.now() - start };
  }
}

function checkEnvVar(name: string, required: boolean): CheckFn {
  return async () => {
    const value = process.env[name];
    if (!value && required) return { status: 'fail', message: `Missing required env var: ${name}` };
    if (!value && !required) return { status: 'warn', message: `Optional env var not set: ${name}` };
    return { status: 'pass', message: `${name} is set` };
  };
}

function checkDatabaseUrl(): CheckFn {
  return async () => {
    const url = process.env['DATABASE_URL'];
    if (!url) return { status: 'fail', message: 'DATABASE_URL not configured' };
    if (!url.startsWith('postgres')) return { status: 'fail', message: 'DATABASE_URL must be a PostgreSQL connection string' };
    return { status: 'pass', message: 'DATABASE_URL configured' };
  };
}

function checkRedisUrl(): CheckFn {
  return async () => {
    const url = process.env['REDIS_URL'];
    if (!url) return { status: 'warn', message: 'REDIS_URL not set — caching disabled' };
    if (!url.startsWith('redis')) return { status: 'fail', message: 'REDIS_URL must be a Redis connection string' };
    return { status: 'pass', message: 'REDIS_URL configured' };
  };
}

function checkPort(): CheckFn {
  return async () => {
    const port = process.env['PORT'] ?? '3001';
    const num = parseInt(port, 10);
    if (isNaN(num) || num < 1 || num > 65535) return { status: 'fail', message: `Invalid PORT: ${port}` };
    return { status: 'pass', message: `Port ${num} configured` };
  };
}

function checkNodeEnv(): CheckFn {
  return async () => {
    const env = process.env['NODE_ENV'] ?? 'development';
    const valid = ['development', 'production', 'test'];
    if (!valid.includes(env)) return { status: 'warn', message: `Unusual NODE_ENV: ${env}` };
    return { status: 'pass', message: `NODE_ENV=${env}` };
  };
}

export async function runStartupChecks(): Promise<StartupReport> {
  const checks: Array<[string, CheckFn]> = [
    ['Database URL', checkDatabaseUrl()],
    ['Redis URL', checkRedisUrl()],
    ['Port', checkPort()],
    ['Node Environment', checkNodeEnv()],
    ['JWT Secret', checkEnvVar('JWT_SECRET', true)],
    ['CORS Origins', checkEnvVar('CORS_ORIGINS', false)],
  ];

  const start = Date.now();
  const results: StartupCheckResult[] = [];

  for (const [name, fn] of checks) {
    const result = await runCheck(name, fn);
    results.push(result);

    const icon = result.status === 'pass' ? '✓' : result.status === 'warn' ? '⚠' : '✗';
    const logFn = result.status === 'fail' ? logger.error.bind(logger) : result.status === 'warn' ? logger.warn.bind(logger) : logger.info.bind(logger);
    logFn({ check: name, status: result.status, durationMs: result.durationMs }, `${icon} ${name}: ${result.message}`);
  }

  const allPassed = results.every((r) => r.status !== 'fail');
  const report: StartupReport = {
    allPassed,
    results,
    totalDurationMs: Date.now() - start,
    timestamp: new Date(),
  };

  if (!allPassed) {
    logger.error({ failedChecks: results.filter((r) => r.status === 'fail').map((r) => r.name) }, 'Startup checks failed');
  } else {
    logger.info({ totalDurationMs: report.totalDurationMs, warnings: results.filter((r) => r.status === 'warn').length }, 'All startup checks passed');
  }

  return report;
}
