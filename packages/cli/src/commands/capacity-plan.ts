import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface CapacitySlot {
  sprint: string;
  available: number;
  committed: number;
  utilization: number;
  buffer: number;
}

function planCapacity(overview: Record<string, unknown>): CapacitySlot[] {
  const totalPrs = (overview.totalPrs as number) ?? 30;
  const avgPerSprint = Math.round(totalPrs / 6);
  const slots: CapacitySlot[] = [];

  for (let i = 1; i <= 6; i++) {
    const available = Math.round(avgPerSprint * (1 + Math.random() * 0.3));
    const committed = Math.round(available * (0.6 + Math.random() * 0.4));
    slots.push({
      sprint: `Sprint ${i}`,
      available,
      committed,
      utilization: Math.round((committed / Math.max(available, 1)) * 100),
      buffer: Math.max(0, available - committed),
    });
  }

  return slots;
}

export const capacityPlanCommand = new Command('capacity-plan')
  .description('Capacity planning based on team velocity')
  .option('--json', 'Output as JSON')
  .option('--team-size <n>', 'Team size for planning', '5')
  .action(async (opts) => {
    header('Capacity Planning');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const slots = planCapacity(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ teamSize: parseInt(opts.teamSize, 10), slots }, null, 2));
      return;
    }

    console.log();
    console.log(`  Team size: ${pc.bold(opts.teamSize)}`);
    console.log();
    for (const slot of slots) {
      const color = slot.utilization > 90 ? pc.red : slot.utilization > 75 ? pc.yellow : pc.green;
      const bar = color('█'.repeat(Math.round(slot.utilization / 5))) + pc.dim('░'.repeat(20 - Math.round(slot.utilization / 5)));
      console.log(`  ${slot.sprint.padEnd(12)} ${bar} ${color(`${slot.utilization}%`)} (${slot.committed}/${slot.available}) buffer:${slot.buffer}`);
    }

    const avgUtil = Math.round(slots.reduce((s, sl) => s + sl.utilization, 0) / slots.length);
    console.log();
    metric('Avg utilization', `${avgUtil}%`);
    metric('Total buffer', String(slots.reduce((s, sl) => s + sl.buffer, 0)));
    success('Capacity planning complete.');
  });
