export type UsageEventType = 'api_call' | 'collection_run' | 'report_generated' | 'export' | 'cli_command' | 'webhook_delivery' | 'storage_used' | 'compute_minutes';
export type QuotaAlertSeverity = 'info' | 'warning' | 'critical' | 'exceeded';
export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface UsageEvent {
  id: string;
  organizationId: string;
  userId: string | null;
  type: UsageEventType;
  resource: string;
  quantity: number;
  unit: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
  billingPeriod: string;
  projectId: string | null;
}

export interface UsageReport {
  id: string;
  organizationId: string;
  period: ReportPeriod;
  startDate: Date;
  endDate: Date;
  summary: UsageSummary;
  breakdown: UsageBreakdown[];
  quotaStatus: QuotaStatus[];
  generatedAt: Date;
  totalCost: number;
  currency: string;
}

export interface UsageSummary {
  totalApiCalls: number;
  totalCollectionRuns: number;
  totalReportsGenerated: number;
  totalExports: number;
  totalCliCommands: number;
  totalWebhookDeliveries: number;
  storageUsedBytes: number;
  computeMinutes: number;
}

export interface UsageBreakdown {
  type: UsageEventType;
  count: number;
  totalQuantity: number;
  unit: string;
  cost: number;
  trend: number;
  byProject: Record<string, number>;
}

export interface QuotaStatus {
  resource: string;
  limit: number;
  used: number;
  remaining: number;
  usedPercent: number;
  unit: string;
  resetsAt: Date;
}

export interface QuotaAlert {
  id: string;
  organizationId: string;
  resource: string;
  severity: QuotaAlertSeverity;
  threshold: number;
  currentUsage: number;
  limit: number;
  message: string;
  acknowledged: boolean;
  acknowledgedBy: string | null;
  triggeredAt: Date;
  acknowledgedAt: Date | null;
}

export interface UsageTrend {
  date: string;
  type: UsageEventType;
  count: number;
  cumulativeCount: number;
  projectedMonthEnd: number;
}
