import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info, success } from '../utils/display.js';

interface OnboardingStep {
  order: number;
  title: string;
  description: string;
  command: string | null;
}

function generateOnboardingGuide(_overview: Record<string, unknown>): OnboardingStep[] {
  return [
    { order: 1, title: 'Clone & Install', description: 'Clone the repository and install dependencies', command: 'pnpm install' },
    { order: 2, title: 'Environment Setup', description: 'Copy .env.example to .env and configure secrets', command: 'cp .env.example .env' },
    { order: 3, title: 'Database Setup', description: 'Generate Prisma client and push schema', command: 'pnpm db:push' },
    { order: 4, title: 'Seed Data', description: 'Load demo data for development', command: 'pnpm db:seed' },
    { order: 5, title: 'Start Dev Server', description: 'Run the development environment', command: 'pnpm dev' },
    { order: 6, title: 'Run Tests', description: 'Verify everything works', command: 'pnpm test' },
    { order: 7, title: 'Read the Docs', description: 'Review AGENTS.md and project.md for coding guidelines', command: null },
    { order: 8, title: 'Try the CLI', description: 'Test the VibeBetter CLI tool', command: 'npx vibe status' },
  ];
}

export const onboardDevCommand = new Command('onboard-dev')
  .description('Generate onboarding guide for new developers')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Developer Onboarding Guide');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const steps = generateOnboardingGuide(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify(steps, null, 2));
      return;
    }

    console.log();
    for (const step of steps) {
      console.log(`  ${pc.bold(pc.cyan(`${step.order}.`))} ${pc.bold(step.title)}`);
      console.log(`     ${step.description}`);
      if (step.command) {
        console.log(`     ${pc.dim('$')} ${pc.green(step.command)}`);
      }
      console.log();
    }

    info(`${steps.length} onboarding steps generated.`);
    success('Onboarding guide ready.');
  });
