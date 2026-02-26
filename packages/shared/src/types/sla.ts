export type SLAStatus = 'met' | 'at_risk' | 'breached' | 'not_applicable';
export type SLIType = 'availability' | 'latency' | 'throughput' | 'error_rate' | 'saturation' | 'freshness';
export type SLOWindow = 'rolling_7d' | 'rolling_28d' | 'rolling_30d' | 'rolling_90d' | 'calendar_month' | 'calendar_quarter';

export interface SLA {
  id: string;
  name: string;
  description: string;
  serviceId: string;
  customerId: string | null;
  tier: string;
  objectives: SLO[];
  penalties: SLAPenalty[];
  effectiveFrom: Date;
  effectiveUntil: Date | null;
  status: SLAStatus;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SLO {
  id: string;
  slaId: string;
  name: string;
  description: string;
  indicator: SLI;
  target: number;
  window: SLOWindow;
  currentValue: number | null;
  errorBudget: ErrorBudget;
  status: SLAStatus;
  alertThreshold: number;
  burnRateThreshold: number;
}

export interface SLI {
  id: string;
  sloId: string;
  type: SLIType;
  name: string;
  description: string;
  unit: string;
  goodEventFilter: string;
  totalEventFilter: string;
  source: string;
  aggregation: 'ratio' | 'threshold' | 'percentile';
  percentile: number | null;
}

export interface ErrorBudget {
  total: number;
  consumed: number;
  remaining: number;
  consumedPercent: number;
  burnRate: number;
  estimatedExhaustionDate: Date | null;
  status: 'healthy' | 'warning' | 'critical' | 'exhausted';
}

export interface SLAPenalty {
  condition: string;
  type: 'credit' | 'refund' | 'escalation' | 'notification';
  amount: number | null;
  description: string;
}

export interface SLAReport {
  slaId: string;
  period: string;
  overallStatus: SLAStatus;
  objectiveResults: SLOResult[];
  uptimePercent: number;
  incidentCount: number;
  meanTimeToRecover: number;
  generatedAt: Date;
}

export interface SLOResult {
  sloId: string;
  name: string;
  target: number;
  actual: number;
  met: boolean;
  errorBudgetRemaining: number;
}
