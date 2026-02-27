import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface ROIResult {
  timeSavedHours: number;
  costPerMonth: number;
  netBenefit: number;
  roiPercent: number;
}

function calculateROI(totalPrs: number, aiPrs: number, costPerMonth: number, hourlyRate: number): ROIResult {
  const avgTimeSavedPerPr = 1.5;
  const timeSavedHours = aiPrs * avgTimeSavedPerPr;
  const moneySaved = timeSavedHours * hourlyRate;
  const netBenefit = moneySaved - costPerMonth;
  const roiPercent = costPerMonth > 0 ? Math.round((netBenefit / costPerMonth) * 100) : 0;

  return { timeSavedHours, costPerMonth, netBenefit, roiPercent };
}

export const aiRoiCommand = new Command('ai-roi')
  .description('Calculate AI tool ROI — time saved vs cost')
  .option('--cost <n>', 'Monthly AI tool cost in USD', '50')
  .option('--rate <n>', 'Developer hourly rate in USD', '75')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('AI Tool ROI Calculator');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const totalPrs = (overview as Record<string, unknown>).totalPrs as number ?? 0;
    const aiPrs = (overview as Record<string, unknown>).aiPrs as number ?? 0;
    const cost = parseFloat(opts.cost);
    const rate = parseFloat(opts.rate);

    const roi = calculateROI(totalPrs, aiPrs, cost, rate);

    if (opts.json) {
      console.log(JSON.stringify(roi, null, 2));
      return;
    }

    console.log();
    metric('AI-assisted PRs', `${aiPrs} / ${totalPrs}`);
    metric('Time saved', `${roi.timeSavedHours.toFixed(1)} hours`);
    metric('Monthly cost', `$${roi.costPerMonth}`);
    metric('Money saved', `$${(roi.timeSavedHours * rate).toFixed(0)}`);
    console.log();

    const color = roi.roiPercent > 0 ? pc.green : pc.red;
    console.log(`  ${pc.bold('Net Benefit:')} ${color(`$${roi.netBenefit.toFixed(0)}/month`)}`);
    console.log(`  ${pc.bold('ROI:')} ${color(`${roi.roiPercent}%`)}`);
    console.log();
    success('ROI calculation complete.');
  });
