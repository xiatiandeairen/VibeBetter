export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'change_pct';
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
  enabled: boolean;
  cooldownMinutes: number;
  channels: AlertChannel[];
  createdAt: Date;
}

export interface AlertHistory {
  id: string;
  ruleId: string;
  triggeredAt: Date;
  resolvedAt?: Date;
  metricValue: number;
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
  acknowledged: boolean;
  acknowledgedBy?: string;
  notes?: string;
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'pagerduty' | 'teams';
  target: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface AlertSummary {
  totalRules: number;
  activeAlerts: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  lastTriggered?: Date;
  avgResolutionMinutes: number;
}

export interface AlertConfig {
  globalCooldownMinutes: number;
  maxAlertsPerHour: number;
  autoResolveAfterMinutes: number;
  escalationEnabled: boolean;
  escalationDelayMinutes: number;
}
