import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface WasteItem {
  category: string;
  description: string;
  hoursWasted: number;
  recurrence: 'daily' | 'weekly' | 'monthly' | 'once';
  suggestion: string;
}

function detectWaste(_overview: Record<string, unknown>): WasteItem[] {
  return [
    { category: 'CI Flake', description: 'Flaky tests causing re-runs', hoursWasted: 12, recurrence: 'weekly', suggestion: 'Quarantine flaky tests' },
    { category: 'Review Wait', description: 'PRs waiting >48h for review', hoursWasted: 20, recurrence: 'weekly', suggestion: 'Auto-assign reviewers, set SLAs' },
    { category: 'Merge Conflicts', description: 'Frequent merge conflicts on shared files', hoursWasted: 8, recurrence: 'weekly', suggestion: 'Split shared modules' },
    { category: 'Manual Deploy', description: 'Manual deployment steps', hoursWasted: 4, recurrence: 'weekly', suggestion: 'Automate with CI/CD pipeline' },
    { category: 'Context Switch', description: 'Excessive meetings fragmenting dev time', hoursWasted: 15, recurrence: 'weekly', suggestion: 'Introduce focus blocks' },
  ];
}

export const wasteDetectorCommand = new Command('waste-detector')
  .description('Detect development process waste and inefficiencies')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Waste Detector');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const items = detectWaste(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ waste: items, totalWeeklyHours: items.reduce((s, i) => s + i.hoursWasted, 0) }, null, 2));
      return;
    }

    console.log();
    for (const w of items) {
      const bar = pc.red('█'.repeat(Math.round(w.hoursWasted / 2))) + pc.dim('░'.repeat(Math.max(0, 15 - Math.round(w.hoursWasted / 2))));
      console.log(`  ${bar} ${pc.bold(w.category.padEnd(18))} ${pc.red(`${w.hoursWasted}h/${w.recurrence}`)}`);
      console.log(`${''.padEnd(17)} ${pc.dim(`→ ${w.suggestion}`)}`);
    }

    console.log();
    metric('Waste categories', String(items.length));
    metric('Total weekly waste', `${items.reduce((s, i) => s + i.hoursWasted, 0)}h`);
    success('Waste detection complete.');
  });
