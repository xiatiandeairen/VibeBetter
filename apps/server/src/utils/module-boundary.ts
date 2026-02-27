import { logger } from './logger.js';

export interface BoundaryRule {
  module: string;
  allowedImports: string[];
  forbiddenImports: string[];
  isPublic: boolean;
}

export interface BoundaryViolation {
  sourceModule: string;
  targetModule: string;
  importPath: string;
  rule: string;
  severity: 'error' | 'warning';
}

export class ModuleBoundaryChecker {
  private rules: BoundaryRule[] = [];

  addRule(rule: BoundaryRule): void {
    this.rules.push(rule);
    logger.debug({ module: rule.module }, 'Boundary rule added');
  }

  check(sourceModule: string, importPath: string): BoundaryViolation | null {
    const targetModule = this.extractModule(importPath);
    if (targetModule === sourceModule) return null;

    const rule = this.rules.find(r => r.module === sourceModule);
    if (!rule) return null;

    if (rule.forbiddenImports.includes(targetModule)) {
      return {
        sourceModule,
        targetModule,
        importPath,
        rule: `${sourceModule} cannot import from ${targetModule}`,
        severity: 'error',
      };
    }

    if (rule.allowedImports.length > 0 && !rule.allowedImports.includes(targetModule)) {
      return {
        sourceModule,
        targetModule,
        importPath,
        rule: `${sourceModule} can only import from [${rule.allowedImports.join(', ')}]`,
        severity: 'warning',
      };
    }

    return null;
  }

  checkAll(imports: { sourceModule: string; importPath: string }[]): BoundaryViolation[] {
    const violations: BoundaryViolation[] = [];
    for (const imp of imports) {
      const violation = this.check(imp.sourceModule, imp.importPath);
      if (violation) violations.push(violation);
    }
    logger.info({ totalImports: imports.length, violations: violations.length }, 'Module boundary check complete');
    return violations;
  }

  private extractModule(importPath: string): string {
    const parts = importPath.replace(/^@[^/]+\//, '').split('/');
    return parts[0] ?? importPath;
  }
}
