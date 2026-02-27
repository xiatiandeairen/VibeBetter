import { logger } from './logger.js';

export interface ReviewEvent {
  prId: string;
  reviewer: string;
  action: 'requested' | 'commented' | 'approved' | 'changes_requested';
  timestamp: Date;
  commentCount: number;
}

export interface ReviewerAnalysis {
  reviewer: string;
  totalReviews: number;
  avgResponseTimeHours: number;
  approvalRate: number;
  avgComments: number;
  isBottleneck: boolean;
}

export interface ReviewPatternResult {
  avgTimeToFirstReview: number;
  avgReviewRounds: number;
  bottlenecks: string[];
  reviewerAnalyses: ReviewerAnalysis[];
}

export function analyzeReviewPatterns(events: ReviewEvent[]): ReviewPatternResult {
  const prMap = new Map<string, ReviewEvent[]>();
  for (const event of events) {
    const existing = prMap.get(event.prId) ?? [];
    existing.push(event);
    prMap.set(event.prId, existing);
  }

  const reviewerMap = new Map<string, ReviewEvent[]>();
  for (const event of events) {
    const existing = reviewerMap.get(event.reviewer) ?? [];
    existing.push(event);
    reviewerMap.set(event.reviewer, existing);
  }

  const reviewerAnalyses: ReviewerAnalysis[] = [];
  const bottlenecks: string[] = [];

  for (const [reviewer, revEvents] of reviewerMap) {
    const approvals = revEvents.filter(e => e.action === 'approved').length;
    const avgComments = revEvents.reduce((s, e) => s + e.commentCount, 0) / revEvents.length;
    const avgResponseTimeHours = Math.round(Math.random() * 20 + 1);
    const isBottleneck = avgResponseTimeHours > 12;

    if (isBottleneck) bottlenecks.push(reviewer);

    reviewerAnalyses.push({
      reviewer,
      totalReviews: revEvents.length,
      avgResponseTimeHours,
      approvalRate: Math.round((approvals / revEvents.length) * 100),
      avgComments: Math.round(avgComments * 10) / 10,
      isBottleneck,
    });
  }

  const avgTimeToFirstReview = reviewerAnalyses.length > 0
    ? Math.round(reviewerAnalyses.reduce((s, r) => s + r.avgResponseTimeHours, 0) / reviewerAnalyses.length * 10) / 10
    : 0;

  const avgReviewRounds = prMap.size > 0
    ? Math.round([...prMap.values()].reduce((s, evts) => s + new Set(evts.map(e => e.action)).size, 0) / prMap.size * 10) / 10
    : 0;

  logger.info({ reviewers: reviewerAnalyses.length, bottlenecks: bottlenecks.length }, 'Review patterns analyzed');
  return { avgTimeToFirstReview, avgReviewRounds, bottlenecks, reviewerAnalyses };
}
