export interface VelocityPoint {
  sprintId: string;
  sprintName: string;
  startDate: Date;
  endDate: Date;
  planned: number;
  completed: number;
  carryOver: number;
  velocity: number;
}

export interface SprintMetrics {
  sprintId: string;
  velocity: number;
  commitCount: number;
  prsMerged: number;
  avgCycleTimeDays: number;
  avgLeadTimeDays: number;
  scopeChangePct: number;
  teamSize: number;
  perCapitaVelocity: number;
}

export interface Throughput {
  period: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  dataPoints: ThroughputPoint[];
  avgThroughput: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  predictedNext: number;
  confidenceInterval: { low: number; high: number };
}

export interface ThroughputPoint {
  date: Date;
  itemsCompleted: number;
  storyPoints: number;
  prsDelivered: number;
}

export interface VelocityConfig {
  sprintLengthDays: number;
  velocityUnit: 'story-points' | 'items' | 'prs';
  rollingWindowSprints: number;
  excludeOutliers: boolean;
}
