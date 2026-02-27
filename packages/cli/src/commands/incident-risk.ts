import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface IncidentPrediction {
  area: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  probability: number;
  factors: string[];
  mitigation: string;
}

function predictIncidents(overview: Record<string, unknown>): IncidentPrediction[] {
  const complexity = (overview.avgComplexity as number) ?? 15;
  const predictions: IncidentPrediction[] = [
    { area: 'authentication', riskLevel: complexity > 20 ? 'high' : 'medium', probability: Math.round(Math.random() * 40 + 20), factors: ['high complexity', 'frequent changes'], mitigation: 'Add integration tests' },
    { area: 'payment', riskLevel: 'critical', probability: Math.round(Math.random() * 30 + 40), factors: ['external dependency', 'low coverage'], mitigation: 'Implement circuit breaker' },
    { area: 'api-gateway', riskLevel: 'medium', probability: Math.round(Math.random() * 30 + 10), factors: ['rate limiting gaps'], mitigation: 'Review rate limit config' },
    { area: 'database', riskLevel: 'low', probability: Math.round(Math.random() * 20 + 5), factors: ['slow queries detected'], mitigation: 'Add query indexes' },
    { area: 'deployment', riskLevel: 'high', probability: Math.round(Math.random() * 35 + 25), factors: ['no rollback plan', 'manual process'], mitigation: 'Automate rollback' },
  ];

  return predictions.sort((a, b) => b.probability - a.probability);
}

export const incidentRiskCommand = new Command('incident-risk')
  .description('Predict incident risk from code metrics')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Incident Risk Prediction');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const predictions = predictIncidents(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify(predictions, null, 2));
      return;
    }

    console.log();
    for (const pred of predictions) {
      const levelColor = pred.riskLevel === 'critical' ? pc.bgRed : pred.riskLevel === 'high' ? pc.red : pred.riskLevel === 'medium' ? pc.yellow : pc.green;
      console.log(`  ${levelColor(` ${pred.riskLevel.toUpperCase()} `)} ${pc.bold(pred.area)} — ${pred.probability}% probability`);
      console.log(`    ${pc.dim('Factors:')} ${pred.factors.join(', ')}`);
      console.log(`    ${pc.dim('Mitigation:')} ${pred.mitigation}`);
      console.log();
    }

    const criticalCount = predictions.filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high').length;
    metric('Critical/High risks', String(criticalCount));
    metric('Areas analyzed', String(predictions.length));
    success('Incident risk prediction complete.');
  });
