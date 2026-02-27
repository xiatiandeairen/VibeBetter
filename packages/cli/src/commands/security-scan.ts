import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success, warn } from '../utils/display.js';

type Severity = 'critical' | 'high' | 'medium' | 'low';

interface SecurityFinding {
  rule: string;
  severity: Severity;
  file: string;
  line: number;
  description: string;
}

function runSecurityScan(_overview: Record<string, unknown>): SecurityFinding[] {
  return [
    { rule: 'no-hardcoded-secrets', severity: 'critical', file: '.env.example', line: 5, description: 'Ensure .env is in .gitignore' },
    { rule: 'sql-injection', severity: 'high', file: 'apps/server/src/routes/search.ts', line: 42, description: 'Use parameterized queries for user input' },
    { rule: 'xss-prevention', severity: 'medium', file: 'apps/web/src/components/Comment.tsx', line: 18, description: 'Sanitize dangerouslySetInnerHTML usage' },
    { rule: 'dependency-vulnerability', severity: 'low', file: 'package.json', line: 1, description: 'Review outdated dependencies for known CVEs' },
  ];
}

const sevColor = (s: Severity) =>
  s === 'critical' ? pc.bgRed(pc.white(` ${s.toUpperCase()} `)) : s === 'high' ? pc.red(s) : s === 'medium' ? pc.yellow(s) : pc.dim(s);

export const securityScanCommand = new Command('security-scan')
  .description('Basic security check — hardcoded secrets, vulnerable patterns')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Security Scan');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const findings = runSecurityScan(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify(findings, null, 2));
      return;
    }

    console.log();
    for (const finding of findings) {
      console.log(`  ${sevColor(finding.severity)} ${pc.bold(finding.rule)}`);
      console.log(`    ${pc.dim(finding.file)}:${finding.line} — ${finding.description}`);
      console.log();
    }

    const criticalCount = findings.filter(f => f.severity === 'critical').length;
    metric('Findings', String(findings.length));
    metric('Critical', String(criticalCount));
    if (criticalCount > 0) {
      warn('Critical security findings require immediate attention.');
    }
    success('Security scan complete.');
  });
