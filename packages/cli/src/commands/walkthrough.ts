import { Command } from 'commander';
import pc from 'picocolors';
import { header, info } from '../utils/display.js';

interface FeatureStep {
  command: string;
  title: string;
  description: string;
  category: string;
}

const FEATURE_STEPS: FeatureStep[] = [
  { command: 'vibe init', title: 'Initialize Project', description: 'Set up VibeBetter config for your repository', category: 'Setup' },
  { command: 'vibe check', title: 'Risk Check', description: 'Run a pre-commit structural risk check', category: 'Analysis' },
  { command: 'vibe analyze', title: 'Local Analysis', description: 'Offline analysis of git history (no server needed)', category: 'Analysis' },
  { command: 'vibe status', title: 'Project Status', description: 'View current metrics snapshot and trends', category: 'Monitoring' },
  { command: 'vibe dashboard', title: 'Terminal Dashboard', description: 'TUI dashboard with real-time metrics', category: 'Monitoring' },
  { command: 'vibe health', title: 'Health Assessment', description: 'Comprehensive project health score with letter grade', category: 'Monitoring' },
  { command: 'vibe risk', title: 'Risk Analysis', description: 'Detailed PSRI risk breakdown by module', category: 'Analysis' },
  { command: 'vibe hotspots', title: 'Hotspot Detection', description: 'Find high-risk, high-churn files', category: 'Analysis' },
  { command: 'vibe fix', title: 'Fix Suggestions', description: 'Get actionable improvement recommendations', category: 'Actions' },
  { command: 'vibe report --format html', title: 'Export Report', description: 'Generate a shareable HTML health report', category: 'Reporting' },
  { command: 'vibe ai-score', title: 'AI Score', description: 'Single AI effectiveness score combining all metrics', category: 'AI Metrics' },
  { command: 'vibe sync', title: 'Sync Data', description: 'Trigger data collection and metric computation', category: 'Data' },
  { command: 'vibe digest', title: 'Weekly Digest', description: 'View automated weekly summary', category: 'Reporting' },
  { command: 'vibe insights', title: 'AI Insights', description: 'View AI success rate and tool usage breakdown', category: 'AI Metrics' },
];

export const walkthroughCommand = new Command('walkthrough')
  .description('Guided walkthrough of all VibeBetter CLI features')
  .option('--category <cat>', 'Filter by category (Setup, Analysis, Monitoring, Actions, Reporting, AI Metrics, Data)')
  .action(async (opts) => {
    header('VibeBetter Feature Walkthrough');

    let steps = FEATURE_STEPS;
    if (opts.category) {
      steps = steps.filter(s => s.category.toLowerCase() === opts.category.toLowerCase());
      if (steps.length === 0) {
        console.log(pc.yellow(`  No features found for category "${opts.category}".`));
        console.log(pc.dim(`  Available: Setup, Analysis, Monitoring, Actions, Reporting, AI Metrics, Data`));
        return;
      }
    }

    const categories = [...new Set(steps.map(s => s.category))];

    for (const cat of categories) {
      console.log();
      console.log(`  ${pc.bold(pc.cyan(`── ${cat} ──`))}`);
      const catSteps = steps.filter(s => s.category === cat);
      for (const [i, step] of catSteps.entries()) {
        const num = pc.dim(`${i + 1}.`);
        console.log(`  ${num} ${pc.bold(step.title)}`);
        console.log(`     ${pc.dim('$')} ${pc.green(step.command)}`);
        console.log(`     ${step.description}`);
      }
    }

    console.log();
    info(`Total: ${steps.length} features across ${categories.length} categories.`);
    info('Run any command above to get started!');
  });
