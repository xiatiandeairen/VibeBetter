import { Command } from 'commander';
import pc from 'picocolors';
import { header } from '../utils/display.js';

interface TutorialStep {
  title: string;
  command: string;
  description: string;
  tip: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  { title: 'Initialize project', command: 'vibe init', description: 'Connect your project to the VibeBetter platform', tip: 'Use --auto to auto-detect project settings' },
  { title: 'Sync metrics', command: 'vibe sync', description: 'Pull latest data from your repository and compute metrics', tip: 'Sync runs collect → compute → decide automatically' },
  { title: 'Check project health', command: 'vibe check', description: 'Quick risk assessment before committing code', tip: 'Add to your pre-commit hook with: vibe setup-hooks' },
  { title: 'View dashboard', command: 'vibe dashboard', description: 'Open the terminal dashboard with live metrics', tip: 'Press q to exit the dashboard' },
  { title: 'Get AI insights', command: 'vibe insights', description: 'See AI coding tool effectiveness and adoption stats', tip: 'Combine with --json for CI/CD integration' },
  { title: 'Review risky files', command: 'vibe risk', description: 'List files ranked by structural risk score', tip: 'Use vibe why <file> to understand risk factors' },
  { title: 'Generate report', command: 'vibe report', description: 'Create a comprehensive project health report', tip: 'Try --format html for a shareable report' },
];

export const tutorialCommand = new Command('tutorial')
  .description('Interactive tutorial for new VibeBetter CLI users')
  .option('--step <n>', 'Jump to a specific step (1-based)')
  .action(async (opts) => {
    header('VibeBetter Tutorial');

    const startStep = opts.step ? Math.max(0, parseInt(opts.step, 10) - 1) : 0;
    const steps = TUTORIAL_STEPS.slice(startStep);

    console.log(pc.bold(`  Welcome to VibeBetter! Let's get started.\n`));
    console.log(pc.dim(`  ${TUTORIAL_STEPS.length} steps to master your AI coding insights\n`));

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]!;
      const num = startStep + i + 1;
      console.log(`  ${pc.cyan(`Step ${num}/${TUTORIAL_STEPS.length}`)} — ${pc.bold(step.title)}`);
      console.log(`  ${pc.dim(step.description)}`);
      console.log(`  ${pc.green('$')} ${step.command}`);
      console.log(`  ${pc.yellow('💡')} ${pc.dim(step.tip)}`);
      console.log();
    }

    console.log(pc.bold('  🎉 You\'re ready to go!'));
    console.log(pc.dim('  Run any command with --help for detailed usage.'));
  });
