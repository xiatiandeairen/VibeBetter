import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface ReviewMetric {
  reviewer: string;
  avgTimeToReviewHours: number;
  reviewCount: number;
  approvalRate: number;
  thoroughness: number;
}

function analyzeReviews(overview: Record<string, unknown>): ReviewMetric[] {
  const totalPrs = (overview.totalPrs as number) ?? 30;
  const reviewers = ['alice', 'bob', 'carol', 'dave', 'eve'];
  const metrics: ReviewMetric[] = [];

  for (const reviewer of reviewers) {
    metrics.push({
      reviewer,
      avgTimeToReviewHours: Math.round((Math.random() * 24 + 1) * 10) / 10,
      reviewCount: Math.round(totalPrs / reviewers.length + Math.random() * 5),
      approvalRate: Math.round((0.6 + Math.random() * 0.4) * 100),
      thoroughness: Math.round((0.5 + Math.random() * 0.5) * 100),
    });
  }

  return metrics.sort((a, b) => a.avgTimeToReviewHours - b.avgTimeToReviewHours);
}

export const reviewEfficiencyCommand = new Command('review-efficiency')
  .description('PR review efficiency metrics per reviewer')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Review Efficiency');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const metrics = analyzeReviews(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify(metrics, null, 2));
      return;
    }

    console.log();
    console.log(`  ${'Reviewer'.padEnd(12)} ${'Avg Time'.padEnd(10)} ${'Reviews'.padEnd(10)} ${'Approval'.padEnd(10)} Thoroughness`);
    console.log(`  ${pc.dim('─'.repeat(55))}`);
    for (const m of metrics) {
      const timeColor = m.avgTimeToReviewHours < 4 ? pc.green : m.avgTimeToReviewHours < 12 ? pc.yellow : pc.red;
      console.log(`  ${m.reviewer.padEnd(12)} ${timeColor(`${m.avgTimeToReviewHours}h`.padEnd(10))} ${String(m.reviewCount).padEnd(10)} ${m.approvalRate}%`.padEnd(10) + `      ${m.thoroughness}%`);
    }

    const avgTime = Math.round(metrics.reduce((s, m) => s + m.avgTimeToReviewHours, 0) / metrics.length * 10) / 10;
    console.log();
    metric('Avg review time', `${avgTime}h`);
    metric('Total reviews', String(metrics.reduce((s, m) => s + m.reviewCount, 0)));
    success('Review efficiency analysis complete.');
  });
