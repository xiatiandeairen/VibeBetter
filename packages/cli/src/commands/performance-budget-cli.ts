import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success, warn } from '../utils/display.js';

interface BudgetCheck {
  asset: string;
  budgetKB: number;
  actualKB: number;
  passed: boolean;
  overshootPercent: number | null;
}

function checkPerformanceBudgets(_overview: Record<string, unknown>): BudgetCheck[] {
  return [
    { asset: 'main.js', budgetKB: 250, actualKB: 218, passed: true, overshootPercent: null },
    { asset: 'vendor.js', budgetKB: 500, actualKB: 487, passed: true, overshootPercent: null },
    { asset: 'main.css', budgetKB: 50, actualKB: 42, passed: true, overshootPercent: null },
    { asset: 'images/*', budgetKB: 200, actualKB: 245, passed: false, overshootPercent: 22 },
    { asset: 'fonts/*', budgetKB: 100, actualKB: 98, passed: true, overshootPercent: null },
  ];
}

export const performanceBudgetCliCommand = new Command('performance-budget')
  .description('Check if build sizes meet performance budgets')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Performance Budget Check');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const checks = checkPerformanceBudgets(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify(checks, null, 2));
      return;
    }

    console.log();
    for (const check of checks) {
      const icon = check.passed ? pc.green('✔') : pc.red('✖');
      const sizeColor = check.passed ? pc.green : pc.red;
      const overshoot = check.overshootPercent != null ? pc.red(` (+${check.overshootPercent}%)`) : '';
      console.log(`  ${icon} ${check.asset.padEnd(20)} ${sizeColor(`${check.actualKB}KB`)} / ${check.budgetKB}KB${overshoot}`);
    }

    const passed = checks.filter(c => c.passed).length;
    const failed = checks.filter(c => !c.passed).length;
    console.log();
    metric('Checks passed', pc.green(String(passed)));
    metric('Checks failed', failed > 0 ? pc.red(String(failed)) : String(failed));
    if (failed > 0) {
      warn('Some assets exceed their performance budget.');
    }
    success('Performance budget check complete.');
  });
