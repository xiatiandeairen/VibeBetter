import { logger } from './logger.js';

export type RuleSeverity = 'error' | 'warning' | 'info';

export interface ArchitectureRule {
  id: string;
  name: string;
  description: string;
  severity: RuleSeverity;
  fromPattern: string;
  toPattern: string;
  allowed: boolean;
}

export interface Violation {
  ruleId: string;
  ruleName: string;
  severity: RuleSeverity;
  fromFile: string;
  toFile: string;
  importStatement: string;
}

const DEFAULT_RULES: ArchitectureRule[] = [
  { id: 'no-server-in-web', name: 'No server imports in web', description: 'Frontend must not import from server', severity: 'error', fromPattern: 'apps/web/', toPattern: 'apps/server/', allowed: false },
  { id: 'no-web-in-server', name: 'No web imports in server', description: 'Backend must not import from frontend', severity: 'error', fromPattern: 'apps/server/', toPattern: 'apps/web/', allowed: false },
  { id: 'no-app-in-shared', name: 'No app imports in shared', description: 'Shared package must not depend on apps', severity: 'error', fromPattern: 'packages/shared/', toPattern: 'apps/', allowed: false },
  { id: 'no-direct-db', name: 'No direct DB in routes', description: 'Routes should use services, not DB directly', severity: 'warning', fromPattern: 'apps/server/src/routes/', toPattern: 'packages/db/src/', allowed: false },
];

export function getDefaultRules(): ArchitectureRule[] {
  return [...DEFAULT_RULES];
}

export function checkImport(
  fromFile: string,
  toFile: string,
  importStatement: string,
  rules: ArchitectureRule[] = DEFAULT_RULES,
): Violation | null {
  for (const rule of rules) {
    if (!rule.allowed && fromFile.includes(rule.fromPattern) && toFile.includes(rule.toPattern)) {
      logger.warn({ ruleId: rule.id, fromFile, toFile }, 'Architecture violation detected');
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        fromFile,
        toFile,
        importStatement,
      };
    }
  }
  return null;
}

export function checkAllImports(
  imports: Array<{ from: string; to: string; statement: string }>,
  rules?: ArchitectureRule[],
): Violation[] {
  const violations: Violation[] = [];
  for (const imp of imports) {
    const v = checkImport(imp.from, imp.to, imp.statement, rules);
    if (v) violations.push(v);
  }

  if (violations.length > 0) {
    logger.warn({ count: violations.length }, 'Architecture violations found');
  }
  return violations;
}
