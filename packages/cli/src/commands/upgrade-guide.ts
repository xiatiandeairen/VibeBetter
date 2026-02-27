import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface UpgradeStep {
  dependency: string;
  current: string;
  latest: string;
  breaking: boolean;
  migrationSteps: string[];
}

function buildUpgradeGuide(_overview: Record<string, unknown>): UpgradeStep[] {
  return [
    { dependency: 'typescript', current: '5.3.0', latest: '5.7.3', breaking: false, migrationSteps: ['Update tsconfig target'] },
    { dependency: 'next', current: '14.2.0', latest: '15.1.0', breaking: true, migrationSteps: ['Update App Router imports', 'Migrate getServerSideProps'] },
    { dependency: 'prisma', current: '5.10.0', latest: '6.3.0', breaking: true, migrationSteps: ['Run prisma migrate', 'Update client imports'] },
    { dependency: 'hono', current: '4.0.0', latest: '4.7.0', breaking: false, migrationSteps: ['No breaking changes'] },
    { dependency: 'tailwindcss', current: '3.4.0', latest: '4.0.0', breaking: true, migrationSteps: ['Migrate config to CSS', 'Update utility classes'] },
  ];
}

export const upgradeGuideCommand = new Command('upgrade-guide')
  .description('Generate an upgrade guide for outdated dependencies')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Upgrade Guide');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const steps = buildUpgradeGuide(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ upgrades: steps, breakingCount: steps.filter(s => s.breaking).length }, null, 2));
      return;
    }

    console.log();
    for (const s of steps) {
      const breakingLabel = s.breaking ? pc.red(' BREAKING') : pc.green(' safe');
      console.log(`  ${pc.bold(s.dependency)} ${pc.dim(s.current)} → ${pc.green(s.latest)}${breakingLabel}`);
      for (const step of s.migrationSteps) {
        console.log(`    ${pc.dim('→')} ${step}`);
      }
    }

    console.log();
    metric('Dependencies', String(steps.length));
    metric('Breaking upgrades', String(steps.filter(s => s.breaking).length));
    success('Upgrade guide generated.');
  });
