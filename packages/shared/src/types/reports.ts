export type ReportType = 'risk_summary' | 'sprint_review' | 'team_health' | 'compliance' | 'executive';
export type ReportFormat = 'pdf' | 'html' | 'markdown' | 'csv' | 'json';
export type ScheduleFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
export type DeliveryChannel = 'email' | 'slack' | 'webhook' | 's3' | 'dashboard';
export type ReportStatus = 'pending' | 'generating' | 'completed' | 'failed' | 'cancelled';

export interface ReportTemplate {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  type: ReportType;
  format: ReportFormat;
  sections: ReportSection[];
  filters: ReportFilter;
  branding: ReportBranding | null;
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'metrics_overview' | 'risk_breakdown' | 'trend_chart' | 'file_table' | 'decision_list' | 'custom_text';
  order: number;
  visible: boolean;
  config: Record<string, unknown>;
}

export interface ReportFilter {
  projectIds: string[];
  dateRange: { from: Date; to: Date } | null;
  minRiskScore: number | null;
  includeArchived: boolean;
  tags: string[];
}

export interface ReportBranding {
  logoUrl: string | null;
  primaryColor: string;
  companyName: string;
  footerText: string;
}

export interface ReportSchedule {
  id: string;
  templateId: string;
  organizationId: string;
  name: string;
  frequency: ScheduleFrequency;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  timeUtc: string;
  timezone: string;
  enabled: boolean;
  lastRunAt: Date | null;
  nextRunAt: Date;
  deliveries: ReportDelivery[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportDelivery {
  id: string;
  scheduleId: string;
  channel: DeliveryChannel;
  config: EmailDeliveryConfig | SlackDeliveryConfig | WebhookDeliveryConfig | S3DeliveryConfig;
  enabled: boolean;
}

export interface EmailDeliveryConfig {
  recipients: string[];
  subject: string;
  includeInline: boolean;
  attachReport: boolean;
}

export interface SlackDeliveryConfig {
  webhookUrl: string;
  channel: string;
  mentionUsers: string[];
}

export interface WebhookDeliveryConfig {
  url: string;
  headers: Record<string, string>;
  method: 'POST' | 'PUT';
}

export interface S3DeliveryConfig {
  bucket: string;
  prefix: string;
  region: string;
  filenamePattern: string;
}

export interface ReportRun {
  id: string;
  scheduleId: string | null;
  templateId: string;
  status: ReportStatus;
  format: ReportFormat;
  fileSizeBytes: number | null;
  downloadUrl: string | null;
  error: string | null;
  generatedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}
