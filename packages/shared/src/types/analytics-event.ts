export type EventSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical';
export type EventCategory = 'user' | 'system' | 'api' | 'integration' | 'billing' | 'security';

export interface EventSchema {
  name: string;
  version: number;
  category: EventCategory;
  requiredFields: string[];
  optionalFields: string[];
  validationRules: Record<string, string>;
}

export interface AnalyticsEvent {
  id: string;
  schema: string;
  schemaVersion: number;
  category: EventCategory;
  severity: EventSeverity;
  name: string;
  userId?: string;
  sessionId?: string;
  projectId?: string;
  properties: Record<string, unknown>;
  context: EventContext;
  timestamp: Date;
  receivedAt: Date;
}

export interface EventContext {
  ip?: string;
  userAgent?: string;
  locale?: string;
  timezone?: string;
  referrer?: string;
  page?: string;
}

export interface EventProcessor {
  name: string;
  enabled: boolean;
  filter: EventFilter;
  transform?: Record<string, string>;
  destination: string;
  batchSize: number;
  flushIntervalMs: number;
}

export interface EventFilter {
  categories?: EventCategory[];
  severities?: EventSeverity[];
  namePattern?: string;
  excludePatterns?: string[];
}
