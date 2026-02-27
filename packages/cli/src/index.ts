#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { contextCommand } from './commands/context.js';
import { promptCommand } from './commands/prompt.js';
import { guardCommand } from './commands/guard.js';
import { rulesCommand } from './commands/rules.js';
import { flowCommand } from './commands/flow-workflow.js';
import { boundaryCommand } from './commands/boundary.js';
import { qualityCommand } from './commands/quality-check.js';

const program = new Command();
program
  .name('vibe')
  .description('VibeBetter — AI Coding Workflow Companion')
  .version('5.0.0');

program.addCommand(initCommand);
program.addCommand(contextCommand);
program.addCommand(promptCommand);
program.addCommand(guardCommand);
program.addCommand(rulesCommand);
program.addCommand(flowCommand);
program.addCommand(boundaryCommand);
program.addCommand(qualityCommand);

program.parse();
