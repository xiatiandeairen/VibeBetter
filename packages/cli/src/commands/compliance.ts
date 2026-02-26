import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

interface ComplianceRule {
  id: string;
  name: string;
  metric: string;
  operator: 'lt' | 'lte' | 'gt' | 'gte';
  threshold: number;
  severity: 'critical' | 'major' | 'minor';
  description: string;
}

interface ComplianceResult {
  rule: ComplianceRule;
  actual: number;
  passed: boolean;
}

const DEFAULT_RULES: ComplianceRule[] = [
  { id: 'COMP-001', name: 'Max PSRI', metric: 'psri', operator: 'lte', threshold: 0.6, severity: 'critical', description: 'PSRI must not exceed 0.6' },
  { id: 'COMP-002', name: 'Max TDI', metric: 'tdi', operator: 'lte', threshold: 0.5, severity: 'major', description: 'TDI must not exceed 0.5' },
  { id: 'COMP-003', name: 'Min AI Success', metric: 'aiSuccessRate', operator: 'gte', threshold: 0.5, severity: 'major', description: 'AI Success Rate must be at least 50%' },
  { id: 'COMP-004', name: 'Max Hotspots', metric: 'hotspots', operator: 'lte', threshold: 15, severity: 'minor', description: 'Hotspot files should not exceed 15' },
];

function evaluate(actual: number, operator: ComplianceRule['operator'], threshold: number): boolean {
  switch (operator) {
    case 'lt': return actual < threshold;
    case 'lte': return actual <= threshold;
    case 'gt': return actual > threshold;
    case 'gte': return actual >= threshold;
  }
}

function severityIcon(s: ComplianceRule['severity']): string {
  return s === 'critical' ? '🔴' : s === 'major' ? '🟡' : '🔵';
}

export const complianceCommand = new Command('compliance')
  .description('Check if metrics meet compliance thresholds')
  .option('--json', 'Output as JSON')
  .option('--strict', 'Exit with code 1 on any failure')
  .action(async (opts) => {
    header('Compliance Check');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    const metricValues: Record<string, number> = {
      psri: overview.psriScore ?? 0,
      tdi: overview.tdiScore ?? 0,
      aiSuccessRate: overview.aiSuccessRate ?? 0,
      hotspots: overview.hotspotFiles ?? 0,
    };

    const results: ComplianceResult[] = DEFAULT_RULES.map((rule) => {
      const actual = metricValues[rule.metric] ?? 0;
      const passed = evaluate(actual, rule.operator, rule.threshold);
      return { rule, actual, passed };
    });

    const passed = results.filter((r) => r.passed);
    const failed = results.filter((r) => !r.passed);

    if (opts.json) {
      console.log(JSON.stringify({ passed: passed.length, failed: failed.length, results }, null, 2));
      if (opts.strict && failed.length > 0) process.exit(1);
      return;
    }

    console.log(pc.bold(`  Compliance: ${passed.length}/${results.length} rules passed\n`));

    for (const r of results) {
      const icon = r.passed ? pc.green('✓') : pc.red('✗');
      const sIcon = r.passed ? '' : ` ${severityIcon(r.rule.severity)}`;
      console.log(`  ${icon} ${r.rule.id} ${r.rule.name}${sIcon}`);
      console.log(`    ${pc.dim(r.rule.description)}`);
      console.log(`    ${pc.dim('Actual:')} ${r.actual.toFixed(3)} ${pc.dim('Threshold:')} ${r.rule.threshold}`);
      console.log();
    }

    if (failed.length > 0) {
      console.log(pc.red(`  ${failed.length} compliance failure(s) detected`));
      if (opts.strict) process.exit(1);
    } else {
      console.log(pc.green('  All compliance rules passed ✓'));
    }
  });
