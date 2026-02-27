#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { rulesCommand } from './commands/rules.js';
import { scanCommand } from './commands/scan.js';
import { planCommand } from './commands/plan.js';
import { promptCommand } from './commands/prompt.js';
import { guardCommand } from './commands/guard.js';
import { reviewCommand } from './commands/review-check.js';
import { commitCommand } from './commands/commit-check.js';

const program = new Command();
program
  .name('vibe')
  .description('VibeBetter — AI Coding Companion (6 commands)')
  .version('6.0.0');

program.addCommand(initCommand);
program.addCommand(rulesCommand);
program.addCommand(scanCommand);
program.addCommand(planCommand);
program.addCommand(promptCommand);
program.addCommand(guardCommand);
program.addCommand(reviewCommand);
program.addCommand(commitCommand);

program.parse();
