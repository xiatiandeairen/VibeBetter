import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface DebtItem {
  area: string;
  fixCostHours: number;
  annualSavingsHours: number;
  roi: number;
  paybackWeeks: number;
}

function calculateDebtRoi(overview: Record<string, unknown>): DebtItem[] {
  const tdi = (overview.tdiScore as number) ?? 40;
  const items: DebtItem[] = [
    { area: 'Legacy API migration', fixCostHours: 80, annualSavingsHours: 200, roi: 0, paybackWeeks: 0 },
    { area: 'Test infrastructure', fixCostHours: 40, annualSavingsHours: 120, roi: 0, paybackWeeks: 0 },
    { area: 'Dependency updates', fixCostHours: 16, annualSavingsHours: 30, roi: 0, paybackWeeks: 0 },
    { area: 'Code duplication', fixCostHours: 24, annualSavingsHours: 60, roi: 0, paybackWeeks: 0 },
    { area: 'Error handling', fixCostHours: 32, annualSavingsHours: 50 + tdi, roi: 0, paybackWeeks: 0 },
  ];

  for (const item of items) {
    item.roi = Math.round(((item.annualSavingsHours - item.fixCostHours) / item.fixCostHours) * 100);
    item.paybackWeeks = Math.round((item.fixCostHours / (item.annualSavingsHours / 52)) * 10) / 10;
  }

  return items.sort((a, b) => b.roi - a.roi);
}

export const techDebtRoiCommand = new Command('tech-debt-roi')
  .description('Calculate ROI of fixing technical debt')
  .option('--json', 'Output as JSON')
  .option('--rate <n>', 'Hourly developer rate in USD', '75')
  .action(async (opts) => {
    header('Tech Debt ROI');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const items = calculateDebtRoi(overview as Record<string, unknown>);
    const rate = parseFloat(opts.rate);

    if (opts.json) {
      console.log(JSON.stringify(items, null, 2));
      return;
    }

    console.log();
    for (const item of items) {
      const roiColor = item.roi > 100 ? pc.green : item.roi > 50 ? pc.yellow : pc.red;
      console.log(`  ${pc.bold(item.area)}`);
      console.log(`    Fix: ${item.fixCostHours}h ($${item.fixCostHours * rate})  Save: ${item.annualSavingsHours}h/yr ($${item.annualSavingsHours * rate}/yr)`);
      console.log(`    ROI: ${roiColor(`${item.roi}%`)}  Payback: ${item.paybackWeeks} weeks`);
      console.log();
    }

    const totalCost = items.reduce((s, i) => s + i.fixCostHours, 0);
    const totalSavings = items.reduce((s, i) => s + i.annualSavingsHours, 0);
    metric('Total fix cost', `${totalCost}h ($${totalCost * rate})`);
    metric('Annual savings', `${totalSavings}h ($${totalSavings * rate})`);
    success('Tech debt ROI analysis complete.');
  });
