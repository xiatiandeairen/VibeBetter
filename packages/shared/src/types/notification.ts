export type NotificationChannelType = 'email' | 'slack' | 'webhook' | 'in_app' | 'teams';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
export type NotificationTrigger =
  | 'psri_threshold'
  | 'tdi_threshold'
  | 'ai_success_drop'
  | 'new_hotspot'
  | 'decision_created'
  | 'report_ready'
  | 'weekly_digest'
  | 'custom';

export interface NotificationChannel {
  id: string;
  projectId: string;
  type: NotificationChannelType;
  name: string;
  config: Record<string, unknown>;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationRule {
  id: string;
  projectId: string;
  channelId: string;
  trigger: NotificationTrigger;
  conditions: NotificationCondition[];
  messageTemplate: string;
  priority: NotificationPriority;
  cooldownMinutes: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationCondition {
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'ne';
  value: number | string;
}

export interface NotificationLog {
  id: string;
  ruleId: string;
  channelId: string;
  status: NotificationStatus;
  priority: NotificationPriority;
  subject: string;
  body: string;
  metadata: Record<string, unknown>;
  sentAt: Date | null;
  deliveredAt: Date | null;
  readAt: Date | null;
  error: string | null;
  createdAt: Date;
}

export interface NotificationLogFilter {
  ruleId?: string;
  channelId?: string;
  status?: NotificationStatus;
  priority?: NotificationPriority;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

export interface NotificationLogPage {
  items: NotificationLog[];
  total: number;
  hasMore: boolean;
}
