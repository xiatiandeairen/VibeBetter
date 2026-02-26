export type MetricPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type FunnelStage = 'awareness' | 'acquisition' | 'activation' | 'retention' | 'revenue' | 'referral';

export interface GrowthMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  changePercent: number;
  period: MetricPeriod;
  target: number | null;
  onTrack: boolean;
  recordedAt: Date;
}

export interface Funnel {
  id: string;
  name: string;
  stages: FunnelStageData[];
  totalEntered: number;
  totalConverted: number;
  overallConversionRate: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface FunnelStageData {
  stage: FunnelStage;
  entered: number;
  exited: number;
  converted: number;
  conversionRate: number;
  avgTimeInStageHours: number;
  dropoffRate: number;
}

export interface Cohort {
  id: string;
  name: string;
  startDate: Date;
  size: number;
  retentionByWeek: number[];
  avgLifetimeValueCents: number;
  churnedCount: number;
  activeCount: number;
  source: string;
  tags: string[];
}

export interface Retention {
  cohortId: string;
  week: number;
  activeUsers: number;
  retentionRate: number;
  revenueRetentionRate: number;
  churned: number;
  reactivated: number;
}

export interface GrowthSummary {
  mrrCents: number;
  mrrGrowthPercent: number;
  totalUsers: number;
  newUsersThisPeriod: number;
  churnRate: number;
  ltv: number;
  cac: number;
  ltvCacRatio: number;
  nps: number | null;
}
