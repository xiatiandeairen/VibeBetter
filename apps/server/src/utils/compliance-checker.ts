import { logger } from './logger.js';

export interface ComplianceRule {
  id: string;
  section: string;
  name: string;
  check: (context: ComplianceContext) => ComplianceCheckResult;
}

export interface ComplianceContext {
  hasSecrets: boolean;
  testCoverage: number;
  lintErrors: number;
  outdatedDeps: number;
  hasReadme: boolean;
  hasCi: boolean;
  branchProtection: boolean;
  httpsEnforced: boolean;
}

export interface ComplianceCheckResult {
  status: 'pass' | 'fail' | 'warning';
  details: string;
}

export interface ComplianceReport {
  results: { ruleId: string; section: string; name: string; status: string; details: string }[];
  score: number;
  totalChecks: number;
  passed: number;
  failed: number;
  warnings: number;
}

const defaultRules: ComplianceRule[] = [
  { id: 'SEC-001', section: 'Security', name: 'No hardcoded secrets', check: (ctx) => ({ status: ctx.hasSecrets ? 'fail' : 'pass', details: ctx.hasSecrets ? 'Secrets detected' : 'No secrets found' }) },
  { id: 'SEC-002', section: 'Security', name: 'HTTPS enforced', check: (ctx) => ({ status: ctx.httpsEnforced ? 'pass' : 'fail', details: ctx.httpsEnforced ? 'TLS enabled' : 'HTTP allowed' }) },
  { id: 'QA-001', section: 'Quality', name: 'Test coverage > 80%', check: (ctx) => ({ status: ctx.testCoverage >= 80 ? 'pass' : ctx.testCoverage >= 60 ? 'warning' : 'fail', details: `Coverage: ${ctx.testCoverage}%` }) },
  { id: 'QA-002', section: 'Quality', name: 'No lint errors', check: (ctx) => ({ status: ctx.lintErrors === 0 ? 'pass' : 'fail', details: `${ctx.lintErrors} errors` }) },
  { id: 'QA-003', section: 'Quality', name: 'Dependencies up to date', check: (ctx) => ({ status: ctx.outdatedDeps === 0 ? 'pass' : ctx.outdatedDeps <= 5 ? 'warning' : 'fail', details: `${ctx.outdatedDeps} outdated` }) },
  { id: 'DOC-001', section: 'Documentation', name: 'README exists', check: (ctx) => ({ status: ctx.hasReadme ? 'pass' : 'fail', details: ctx.hasReadme ? 'Present' : 'Missing' }) },
  { id: 'PROC-001', section: 'Process', name: 'CI configured', check: (ctx) => ({ status: ctx.hasCi ? 'pass' : 'fail', details: ctx.hasCi ? 'Active' : 'Not configured' }) },
  { id: 'PROC-002', section: 'Process', name: 'Branch protection', check: (ctx) => ({ status: ctx.branchProtection ? 'pass' : 'warning', details: ctx.branchProtection ? 'Enabled' : 'Disabled' }) },
];

export function checkCompliance(context: ComplianceContext, rules: ComplianceRule[] = defaultRules): ComplianceReport {
  const results = rules.map(rule => {
    const result = rule.check(context);
    return { ruleId: rule.id, section: rule.section, name: rule.name, status: result.status, details: result.details };
  });

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const score = Math.round((passed / Math.max(results.length, 1)) * 100);

  logger.info({ totalChecks: results.length, passed, failed, score }, 'Compliance check complete');
  return { results, score, totalChecks: results.length, passed, failed, warnings };
}
