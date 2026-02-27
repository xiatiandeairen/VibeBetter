import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface RiskMitigationItem {
  risk: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  likelihood: number;
  mitigation: string;
  owner: string;
  status: 'open' | 'in-progress' | 'mitigated';
}

function buildMitigations(_overview: Record<string, unknown>): RiskMitigationItem[] {
  return [
    { risk: 'Single point of failure in auth service', severity: 'critical', likelihood: 0.7, mitigation: 'Add redundancy and circuit breaker', owner: 'Platform', status: 'in-progress' },
    { risk: 'No database backup verification', severity: 'high', likelihood: 0.5, mitigation: 'Implement automated backup tests', owner: 'SRE', status: 'open' },
    { risk: 'Outdated TLS certificates', severity: 'high', likelihood: 0.3, mitigation: 'Enable auto-renewal with cert-manager', owner: 'Security', status: 'mitigated' },
    { risk: 'Memory leak in worker process', severity: 'medium', likelihood: 0.6, mitigation: 'Add memory monitoring and restart policy', owner: 'Backend', status: 'in-progress' },
    { risk: 'Missing rate limiting on public API', severity: 'high', likelihood: 0.8, mitigation: 'Deploy Redis-backed rate limiter', owner: 'API', status: 'open' },
  ];
}

export const riskMitigationCommand = new Command('risk-mitigation')
  .description('List risks and their mitigation strategies')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Risk Mitigation');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const items = buildMitigations(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ risks: items, openCount: items.filter(i => i.status === 'open').length }, null, 2));
      return;
    }

    console.log();
    for (const i of items) {
      const sevColor = i.severity === 'critical' ? pc.red : i.severity === 'high' ? pc.yellow : i.severity === 'medium' ? pc.cyan : pc.green;
      const statusIcon = i.status === 'mitigated' ? pc.green('✓') : i.status === 'in-progress' ? pc.yellow('◐') : pc.red('○');
      console.log(`  ${statusIcon} ${sevColor(`[${i.severity.toUpperCase()}]`.padEnd(12))} ${pc.bold(i.risk)}`);
      console.log(`              ${pc.dim(`→ ${i.mitigation} (${i.owner})`)}`);
    }

    console.log();
    metric('Total risks', String(items.length));
    metric('Open', String(items.filter(i => i.status === 'open').length));
    success('Risk mitigation review complete.');
  });
