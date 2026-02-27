#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { rulesCommand } from './commands/rules.js';
import { scanCommand } from './commands/scan.js';
import { planCommand } from './commands/plan.js';
import { contextCommand } from './commands/context.js';
import { promptCommand } from './commands/prompt.js';
import { reviewCommand } from './commands/review-v7.js';
import { testCommand } from './commands/test-check.js';
import { commitCommand } from './commands/commit-check.js';

const program = new Command();
program
  .name('vibe')
  .description('VibeBetter — AI Coding Companion')
  .version('7.0.0');

program.addCommand(scanCommand);
program.addCommand(planCommand);
program.addCommand(contextCommand);
program.addCommand(promptCommand);
program.addCommand(reviewCommand);
program.addCommand(testCommand);
program.addCommand(commitCommand);
program.addCommand(rulesCommand);
program.addCommand(initCommand);

program.parse();
