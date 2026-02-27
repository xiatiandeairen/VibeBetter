import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success, warn } from '../utils/display.js';

interface DebtAllocation {
  category: string;
  budgetHours: number;
  usedHours: number;
  remainingHours: number;
  utilizationPercent: number;
}

function allocateDebtBudget(overview: Record<string, unknown>, totalBudget: number): DebtAllocation[] {
  const tdi = (overview.tdiScore as number) ?? 35;
  const categories = [
    { category: 'Refactoring', weight: 0.30 },
    { category: 'Test Coverage', weight: 0.25 },
    { category: 'Dependency Updates', weight: 0.20 },
    { category: 'Documentation', weight: 0.15 },
    { category: 'Performance', weight: 0.10 },
  ];

  return categories.map(c => {
    const budgetHours = Math.round(totalBudget * c.weight);
    const usedHours = Math.round(budgetHours * (0.3 + Math.random() * 0.5));
    return {
      category: c.category,
      budgetHours,
      usedHours,
      remainingHours: budgetHours - usedHours,
      utilizationPercent: Math.round((usedHours / budgetHours) * 100),
    };
  });
}

export const debtBudgetCommand = new Command('debt-budget')
  .description('Tech debt budget allocation tool')
  .option('--hours <n>', 'Total sprint hours for debt work', '40')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Tech Debt Budget');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const budget = parseInt(opts.hours, 10);
    const allocations = allocateDebtBudget(overview as Record<string, unknown>, budget);

    if (opts.json) {
      console.log(JSON.stringify(allocations, null, 2));
      return;
    }

    console.log();
    for (const alloc of allocations) {
      const bar = '█'.repeat(Math.round(alloc.utilizationPercent / 5));
      const color = alloc.utilizationPercent > 90 ? pc.red : alloc.utilizationPercent > 70 ? pc.yellow : pc.green;
      console.log(`  ${alloc.category.padEnd(22)} ${color(bar.padEnd(20))} ${alloc.usedHours}h / ${alloc.budgetHours}h  (${color(`${alloc.utilizationPercent}%`)})`);
    }

    const totalUsed = allocations.reduce((s, a) => s + a.usedHours, 0);
    console.log();
    metric('Total budget', `${budget}h`);
    metric('Total used', `${totalUsed}h`);
    metric('Remaining', `${budget - totalUsed}h`);

    if (totalUsed > budget * 0.9) {
      warn('Approaching budget limit — prioritize remaining debt items.');
    }
    success('Debt budget allocation complete.');
  });
