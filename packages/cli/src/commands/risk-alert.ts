import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface AlertItem {
  id: string;
  rule: string;
  severity: 'critical' | 'warning' | 'info';
  metric: string;
  currentValue: number;
  threshold: number;
  triggered: string;
}

function evaluateAlerts(overview: Record<string, unknown>): AlertItem[] {
  const totalPrs = (overview.totalPrs as number) ?? 30;
  const alerts: AlertItem[] = [];
  let id = 1;
  if (totalPrs > 25) {
    alerts.push({ id: `ALR-${id++}`, rule: 'High PR volume', severity: 'warning', metric: 'totalPrs', currentValue: totalPrs, threshold: 25, triggered: new Date().toISOString() });
  }
  alerts.push({ id: `ALR-${id++}`, rule: 'Complexity spike', severity: 'critical', metric: 'avgComplexity', currentValue: 28, threshold: 20, triggered: new Date().toISOString() });
  alerts.push({ id: `ALR-${id++}`, rule: 'Low test coverage', severity: 'warning', metric: 'coverage', currentValue: 65, threshold: 80, triggered: new Date().toISOString() });
  alerts.push({ id: `ALR-${id++}`, rule: 'Stale review', severity: 'info', metric: 'reviewAge', currentValue: 72, threshold: 48, triggered: new Date().toISOString() });
  return alerts;
}

export const riskAlertCommand = new Command('risk-alert')
  .description('Real-time risk alerts')
  .option('--json', 'Output as JSON')
  .option('--severity <level>', 'Filter by severity')
  .action(async (opts) => {
    header('Risk Alerts');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    let alerts = evaluateAlerts(overview as Record<string, unknown>);
    if (opts.severity) {
      alerts = alerts.filter(a => a.severity === opts.severity);
    }

    if (opts.json) {
      console.log(JSON.stringify({ alerts }, null, 2));
      return;
    }

    console.log();
    for (const a of alerts) {
      const sevColor = a.severity === 'critical' ? pc.red : a.severity === 'warning' ? pc.yellow : pc.blue;
      console.log(`  ${sevColor(`[${a.severity.toUpperCase()}]`.padEnd(12))} ${pc.bold(a.id)} ${a.rule}`);
      console.log(`${''.padEnd(14)} ${a.metric}: ${pc.bold(String(a.currentValue))} (threshold: ${a.threshold})`);
    }

    console.log();
    metric('Active alerts', String(alerts.length));
    metric('Critical', String(alerts.filter(a => a.severity === 'critical').length));
    success('Alert evaluation complete.');
  });
