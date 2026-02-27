import { logger } from './logger.js';

export interface PrData {
  id: string;
  aiAssisted: boolean;
  timeToMergeHours: number;
  reviewTimeHours: number;
  linesChanged: number;
}

export interface RoiResult {
  totalPrs: number;
  aiPrs: number;
  avgTimeSavedPerPr: number;
  totalTimeSaved: number;
  monthlyCost: number;
  monthlySavings: number;
  netBenefit: number;
  roiPercent: number;
}

export function calculateAiRoi(
  prData: PrData[],
  monthlyCostPerSeat: number,
  seats: number,
  hourlyRate: number,
): RoiResult {
  const aiPrs = prData.filter(p => p.aiAssisted);
  const nonAiPrs = prData.filter(p => !p.aiAssisted);

  const avgAiTime = aiPrs.length > 0
    ? aiPrs.reduce((s, p) => s + p.timeToMergeHours, 0) / aiPrs.length
    : 0;
  const avgNonAiTime = nonAiPrs.length > 0
    ? nonAiPrs.reduce((s, p) => s + p.timeToMergeHours, 0) / nonAiPrs.length
    : 0;

  const avgTimeSavedPerPr = Math.max(0, avgNonAiTime - avgAiTime);
  const totalTimeSaved = avgTimeSavedPerPr * aiPrs.length;
  const monthlyCost = monthlyCostPerSeat * seats;
  const monthlySavings = totalTimeSaved * hourlyRate;
  const netBenefit = monthlySavings - monthlyCost;
  const roiPercent = monthlyCost > 0 ? Math.round((netBenefit / monthlyCost) * 100) : 0;

  const result: RoiResult = {
    totalPrs: prData.length,
    aiPrs: aiPrs.length,
    avgTimeSavedPerPr: Math.round(avgTimeSavedPerPr * 10) / 10,
    totalTimeSaved: Math.round(totalTimeSaved * 10) / 10,
    monthlyCost,
    monthlySavings: Math.round(monthlySavings),
    netBenefit: Math.round(netBenefit),
    roiPercent,
  };

  logger.info({ totalPrs: prData.length, aiPrs: aiPrs.length, roiPercent }, 'AI ROI calculated');
  return result;
}
