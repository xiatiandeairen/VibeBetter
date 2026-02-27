export interface ReviewCycle {
  prId: string;
  submittedAt: Date;
  firstReviewAt: Date | null;
  approvedAt: Date | null;
  mergedAt: Date | null;
  timeToFirstReviewHours: number | null;
  timeToApprovalHours: number | null;
  totalCycleHours: number | null;
  reviewRounds: number;
  commentsCount: number;
}

export interface ReviewerStats {
  reviewer: string;
  totalReviews: number;
  avgTimeToReviewHours: number;
  approvalRate: number;
  avgCommentsPerReview: number;
  thoroughnessScore: number;
  responsiveness: 'fast' | 'moderate' | 'slow';
  expertiseAreas: string[];
}

export interface ReviewBottleneck {
  type: 'slow-reviewer' | 'overloaded-reviewer' | 'team-bottleneck' | 'timezone-gap';
  description: string;
  impact: 'high' | 'medium' | 'low';
  affectedPrs: number;
  avgDelayHours: number;
  suggestion: string;
}

export interface ReviewEfficiency {
  projectId: string;
  period: { from: Date; to: Date };
  avgCycleHours: number;
  avgTimeToFirstReview: number;
  avgReviewRounds: number;
  reviewerStats: ReviewerStats[];
  bottlenecks: ReviewBottleneck[];
  trendsVsPrevious: { metric: string; change: number; direction: 'up' | 'down' | 'flat' }[];
}
