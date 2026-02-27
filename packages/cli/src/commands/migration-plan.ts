import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface MigrationStep {
  order: number;
  description: string;
  effort: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
  filesAffected: number;
  estimateHours: number;
}

function generateMigrationPlan(overview: Record<string, unknown>): MigrationStep[] {
  const totalFiles = (overview.totalFiles as number) ?? 50;
  return [
    { order: 1, description: 'Audit current dependency versions', effort: 'low', risk: 'low', filesAffected: 1, estimateHours: 2 },
    { order: 2, description: 'Create compatibility shim layer', effort: 'medium', risk: 'low', filesAffected: Math.round(totalFiles * 0.05), estimateHours: 8 },
    { order: 3, description: 'Update core dependencies', effort: 'medium', risk: 'medium', filesAffected: Math.round(totalFiles * 0.1), estimateHours: 16 },
    { order: 4, description: 'Migrate API call patterns', effort: 'high', risk: 'medium', filesAffected: Math.round(totalFiles * 0.3), estimateHours: 40 },
    { order: 5, description: 'Update test suites', effort: 'medium', risk: 'low', filesAffected: Math.round(totalFiles * 0.2), estimateHours: 24 },
    { order: 6, description: 'Remove compatibility shims', effort: 'low', risk: 'medium', filesAffected: Math.round(totalFiles * 0.05), estimateHours: 4 },
    { order: 7, description: 'Integration testing & validation', effort: 'high', risk: 'high', filesAffected: 0, estimateHours: 16 },
  ];
}

export const migrationPlanCommand = new Command('migration-plan')
  .description('Plan library/framework migrations with risk assessment')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Migration Plan');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const steps = generateMigrationPlan(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify(steps, null, 2));
      return;
    }

    console.log();
    for (const step of steps) {
      const riskColor = step.risk === 'high' ? pc.red : step.risk === 'medium' ? pc.yellow : pc.green;
      console.log(`  ${pc.bold(`${step.order}.`)} ${step.description}`);
      console.log(`     Effort: ${step.effort.padEnd(8)} Risk: ${riskColor(step.risk.padEnd(8))} Files: ${step.filesAffected}  Est: ${step.estimateHours}h`);
      console.log();
    }

    const totalHours = steps.reduce((s, st) => s + st.estimateHours, 0);
    const totalFiles = steps.reduce((s, st) => s + st.filesAffected, 0);
    metric('Total estimate', `${totalHours}h`);
    metric('Files affected', String(totalFiles));
    metric('Steps', String(steps.length));
    success('Migration plan generated.');
  });
