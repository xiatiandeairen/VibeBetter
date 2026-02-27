import { logger } from './logger.js';

export type MigrationRisk = 'safe' | 'cautious' | 'dangerous';

export interface MigrationCheck {
  name: string;
  passed: boolean;
  risk: MigrationRisk;
  message: string;
}

export interface MigrationValidation {
  migrationName: string;
  checks: MigrationCheck[];
  overallRisk: MigrationRisk;
  canAutoApply: boolean;
  warnings: string[];
}

const DANGEROUS_PATTERNS = [
  { pattern: /DROP\s+TABLE/i, name: 'Table drop', risk: 'dangerous' as MigrationRisk, msg: 'Migration drops a table — data loss risk' },
  { pattern: /DROP\s+COLUMN/i, name: 'Column drop', risk: 'dangerous' as MigrationRisk, msg: 'Migration drops a column — data loss risk' },
  { pattern: /ALTER\s+TABLE.*ALTER\s+COLUMN.*TYPE/i, name: 'Type change', risk: 'cautious' as MigrationRisk, msg: 'Column type change may fail if data is incompatible' },
  { pattern: /NOT\s+NULL/i, name: 'NOT NULL constraint', risk: 'cautious' as MigrationRisk, msg: 'Adding NOT NULL without default may fail on existing rows' },
  { pattern: /TRUNCATE/i, name: 'Truncate', risk: 'dangerous' as MigrationRisk, msg: 'Migration truncates a table — data loss risk' },
];

export function validateMigrationSql(migrationName: string, sql: string): MigrationValidation {
  const checks: MigrationCheck[] = [];
  const warnings: string[] = [];

  for (const dp of DANGEROUS_PATTERNS) {
    const matched = dp.pattern.test(sql);
    checks.push({
      name: dp.name,
      passed: !matched,
      risk: matched ? dp.risk : 'safe',
      message: matched ? dp.msg : `No ${dp.name.toLowerCase()} detected`,
    });
    if (matched) warnings.push(dp.msg);
  }

  const hasIndex = /CREATE\s+INDEX/i.test(sql);
  if (hasIndex) {
    const concurrent = /CREATE\s+INDEX\s+CONCURRENTLY/i.test(sql);
    checks.push({
      name: 'Index creation',
      passed: concurrent,
      risk: concurrent ? 'safe' : 'cautious',
      message: concurrent ? 'Index created concurrently' : 'Index creation may lock table — use CONCURRENTLY',
    });
    if (!concurrent) warnings.push('Consider using CREATE INDEX CONCURRENTLY to avoid locks');
  }

  const riskLevels: MigrationRisk[] = checks.map(c => c.risk);
  const overallRisk = riskLevels.includes('dangerous') ? 'dangerous' : riskLevels.includes('cautious') ? 'cautious' : 'safe';
  const canAutoApply = overallRisk === 'safe';

  logger.info({ migrationName, overallRisk, checks: checks.length }, 'Migration validated');

  return { migrationName, checks, overallRisk, canAutoApply, warnings };
}
