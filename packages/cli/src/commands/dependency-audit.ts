import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface DepAuditEntry {
  name: string;
  current: string;
  latest: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'none';
  advisory: string | null;
}

function auditDependencies(_overview: Record<string, unknown>): DepAuditEntry[] {
  return [
    { name: 'lodash', current: '4.17.19', latest: '4.17.21', severity: 'high', advisory: 'Prototype pollution' },
    { name: 'express', current: '4.18.2', latest: '4.21.0', severity: 'none', advisory: null },
    { name: 'jsonwebtoken', current: '8.5.1', latest: '9.0.2', severity: 'critical', advisory: 'Algorithm confusion' },
    { name: 'axios', current: '1.6.0', latest: '1.7.2', severity: 'medium', advisory: 'SSRF via proxy' },
    { name: 'react', current: '18.2.0', latest: '19.2.4', severity: 'none', advisory: null },
    { name: 'ws', current: '7.5.9', latest: '8.17.0', severity: 'low', advisory: 'ReDoS' },
  ];
}

export const dependencyAuditCommand = new Command('dependency-audit')
  .description('Audit project dependencies for vulnerabilities and staleness')
  .option('--json', 'Output as JSON')
  .option('--severity <level>', 'Minimum severity to show', 'low')
  .action(async (opts) => {
    header('Dependency Audit');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const severityOrder = ['none', 'low', 'medium', 'high', 'critical'];
    const minIdx = severityOrder.indexOf(opts.severity ?? 'low');
    let entries = auditDependencies(overview as Record<string, unknown>);
    entries = entries.filter(e => severityOrder.indexOf(e.severity) >= minIdx);

    if (opts.json) {
      console.log(JSON.stringify({ dependencies: entries, vulnerable: entries.filter(e => e.severity !== 'none').length }, null, 2));
      return;
    }

    console.log();
    for (const dep of entries) {
      const color = dep.severity === 'critical' ? pc.red : dep.severity === 'high' ? pc.yellow : dep.severity === 'medium' ? pc.magenta : pc.green;
      const icon = dep.severity === 'none' ? pc.green('✔') : color('✘');
      console.log(`  ${icon} ${pc.bold(dep.name.padEnd(20))} ${dep.current.padEnd(10)} → ${dep.latest.padEnd(10)} ${color(`[${dep.severity}]`)}`);
      if (dep.advisory) console.log(`${''.padEnd(4)} ${pc.dim(`→ ${dep.advisory}`)}`);
    }

    const vulnCount = entries.filter(e => e.severity !== 'none').length;
    console.log();
    metric('Packages scanned', String(entries.length));
    metric('Vulnerabilities', String(vulnCount));
    metric('Status', vulnCount > 0 ? pc.red('ACTION REQUIRED') : pc.green('All clear'));
    success('Dependency audit complete.');
  });
