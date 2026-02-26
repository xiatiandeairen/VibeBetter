import { Command } from 'commander';
import pc from 'picocolors';
import { loadConfig, saveConfig } from '../config.js';
import { header, success, info, error } from '../utils/display.js';

const STEPS = [
  { title: 'Welcome', message: 'VibeBetter helps you understand how AI coding tools impact your engineering quality.' },
  { title: 'How it works', message: 'We analyze your Git history, PRs, and AI tool usage to compute risk scores and insights.' },
  { title: 'Key Metrics', message: 'PSRI (structural risk), TDI (tech debt), AI Success Rate, and Hotspot detection.' },
  { title: 'Getting Started', message: 'Run `vibe init` to connect to your VibeBetter server, then `vibe sync` to pull data.' },
  { title: 'Offline Mode', message: 'Use `vibe analyze` for local git analysis without a server connection.' },
];

export const onboardCommand = new Command('onboard')
  .description('Interactive CLI onboarding wizard')
  .option('--skip-config', 'Skip configuration step')
  .option('--api-url <url>', 'API server URL')
  .option('--api-key <key>', 'API key')
  .option('--project <id>', 'Project ID')
  .action(async (opts) => {
    header('Onboarding Wizard');

    for (let i = 0; i < STEPS.length; i++) {
      const step = STEPS[i]!;
      console.log(`\n  ${pc.bold(pc.cyan(`Step ${i + 1}/${STEPS.length}: ${step.title}`))}`);
      console.log(`  ${step.message}`);
    }
    console.log();

    if (opts.skipConfig) {
      info('Skipping configuration (--skip-config)');
    } else {
      const existing = loadConfig();
      if (existing) {
        success('Configuration already exists');
        info(`API URL: ${existing.apiUrl}`);
        info(`Project: ${existing.projectId}`);
      } else if (opts.apiUrl && opts.apiKey && opts.project) {
        saveConfig({ apiUrl: opts.apiUrl, apiKey: opts.apiKey, projectId: opts.project });
        success('Configuration saved');
      } else {
        info('Run: vibe init --api-url <url> --api-key <key> --project <id>');
      }
    }

    console.log();
    console.log(pc.bold('  Quick Start Commands:\n'));
    const commands = [
      ['vibe check', 'Run a quick health check'],
      ['vibe sync', 'Sync metrics from server'],
      ['vibe analyze', 'Offline local analysis'],
      ['vibe summary', 'Full project summary'],
      ['vibe help-me', 'Troubleshooting guide'],
    ];
    for (const [cmd, desc] of commands) {
      console.log(`  ${pc.cyan(cmd!.padEnd(20))} ${pc.dim(desc!)}`);
    }
    console.log();
    success('Onboarding complete! Start with `vibe check`');
    console.log();
  });
