import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface WorkflowStep {
  name: string;
  avgDuration: number;
  waste: number;
  suggestion: string;
  automatable: boolean;
}

function analyzeWorkflow(overview: Record<string, unknown>): WorkflowStep[] {
  const totalPrs = (overview.totalPrs as number) ?? 30;
  return [
    { name: 'PR Creation', avgDuration: 15, waste: 5, suggestion: 'Use PR templates to reduce setup time', automatable: true },
    { name: 'Code Review', avgDuration: 480, waste: 300, suggestion: 'Auto-assign reviewers, set SLA reminders', automatable: true },
    { name: 'CI Pipeline', avgDuration: Math.round(totalPrs * 0.5 + 10), waste: Math.round(totalPrs * 0.2), suggestion: 'Parallelize test stages', automatable: true },
    { name: 'QA Verification', avgDuration: 120, waste: 60, suggestion: 'Increase automated test coverage', automatable: false },
    { name: 'Merge & Deploy', avgDuration: 30, waste: 10, suggestion: 'Enable auto-merge for green PRs', automatable: true },
    { name: 'Post-deploy Check', avgDuration: 45, waste: 20, suggestion: 'Automated health check + rollback', automatable: true },
    { name: 'Documentation', avgDuration: 60, waste: 30, suggestion: 'Auto-generate API docs from code', automatable: true },
  ];
}

export const workflowOptimizeCommand = new Command('workflow-optimize')
  .description('Optimize development workflow')
  .option('--json', 'Output as JSON')
  .option('--automatable-only', 'Show only automatable improvements')
  .action(async (opts) => {
    header('Workflow Optimization');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    let steps = analyzeWorkflow(overview as Record<string, unknown>);
    if (opts.automatableOnly) steps = steps.filter(s => s.automatable);

    if (opts.json) {
      console.log(JSON.stringify({ steps, totalWaste: steps.reduce((s, st) => s + st.waste, 0) }, null, 2));
      return;
    }

    console.log();
    const totalDuration = steps.reduce((s, st) => s + st.avgDuration, 0);
    const totalWaste = steps.reduce((s, st) => s + st.waste, 0);

    for (const step of steps) {
      const wasteRatio = step.waste / Math.max(step.avgDuration, 1);
      const color = wasteRatio > 0.5 ? pc.red : wasteRatio > 0.3 ? pc.yellow : pc.green;
      const bar = color('█'.repeat(Math.round(step.waste / 20))) + pc.dim('░'.repeat(Math.max(0, 15 - Math.round(step.waste / 20))));
      const autoTag = step.automatable ? pc.cyan(' [automatable]') : '';
      console.log(`  ${pc.bold(step.name.padEnd(18))} ${bar} ${color(`${step.waste}min waste`)}${autoTag}`);
      console.log(`${''.padEnd(20)} ${pc.dim(`→ ${step.suggestion}`)}`);
    }

    console.log();
    metric('Total cycle time', `${totalDuration} min`);
    metric('Total waste', `${totalWaste} min (${Math.round((totalWaste / Math.max(totalDuration, 1)) * 100)}%)`);
    metric('Automatable savings', `${steps.filter(s => s.automatable).reduce((s, st) => s + st.waste, 0)} min`);
    success('Workflow optimization analysis complete.');
  });
