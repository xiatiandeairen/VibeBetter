import { Command } from 'commander';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, success, info } from '../utils/display.js';
import pc from 'picocolors';

export const decisionsCommand = new Command('decisions')
  .description('View and manage decision recommendations')
  .option('--generate', 'Generate new decisions based on current metrics')
  .action(async (opts: { generate?: boolean }) => {
    header('Decisions');
    const config = requireConfig();
    const client = new ApiClient(config);

    if (opts.generate) {
      info('Analyzing metrics and generating decisions...');
      const newDecisions = await client.generateDecisions();
      success(`Generated ${newDecisions.length} new decision(s)`);
      console.log();
    }

    const decisions = await client.getDecisions();
    const pending = decisions.filter(d => d.status === 'PENDING');

    if (pending.length === 0) {
      success('No pending decisions — all clear!');
      return;
    }

    console.log(`  ${pc.bold(String(pending.length))} pending decision(s):`);
    console.log();

    for (const d of pending) {
      const levelColor = d.level === 'CRITICAL' ? pc.red : d.level === 'WARNING' ? pc.yellow : pc.blue;
      console.log(`  ${levelColor(pc.bold(`[${d.level}]`))} ${d.title}`);
      console.log(`  ${pc.dim(d.description)}`);
      console.log();
    }
  });
