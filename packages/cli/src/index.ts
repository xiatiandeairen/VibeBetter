#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { statusCommand } from './commands/status.js';
import { checkCommand } from './commands/check.js';
import { riskCommand } from './commands/risk.js';
import { decisionsCommand } from './commands/decisions.js';
import { insightsCommand } from './commands/insights.js';
import { reportCommand } from './commands/report.js';
import { syncCommand } from './commands/sync.js';
import { analyzeCommand } from './commands/analyze.js';
import { digestCommand } from './commands/digest.js';
import { fixCommand } from './commands/fix.js';
import { prRiskCommand } from './commands/pr-risk.js';
import { diffCommand } from './commands/diff.js';
import { dashboardCommand } from './commands/dashboard.js';
import { healthCommand } from './commands/health.js';

const program = new Command();
program
  .name('vibe')
  .description('VibeBetter CLI — AI Coding Insight in your terminal')
  .version('0.28.0');

program.addCommand(initCommand);
program.addCommand(statusCommand);
program.addCommand(checkCommand);
program.addCommand(riskCommand);
program.addCommand(decisionsCommand);
program.addCommand(insightsCommand);
program.addCommand(reportCommand);
program.addCommand(syncCommand);
program.addCommand(analyzeCommand);
program.addCommand(digestCommand);
program.addCommand(fixCommand);
program.addCommand(prRiskCommand);
program.addCommand(diffCommand);
program.addCommand(dashboardCommand);
program.addCommand(healthCommand);

program.parse();
