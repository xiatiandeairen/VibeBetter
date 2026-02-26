export type AuditAction =
  | 'user.login'
  | 'user.logout'
  | 'user.created'
  | 'user.deleted'
  | 'user.role_changed'
  | 'project.created'
  | 'project.deleted'
  | 'project.settings_changed'
  | 'api_key.created'
  | 'api_key.revoked'
  | 'subscription.created'
  | 'subscription.canceled'
  | 'data.exported'
  | 'data.deleted'
  | 'webhook.created'
  | 'webhook.deleted';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditLog {
  id: string;
  action: AuditAction;
  severity: AuditSeverity;
  actorId: string;
  actorEmail: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface AuditLogFilter {
  actorId?: string;
  action?: AuditAction;
  severity?: AuditSeverity;
  targetType?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

export interface AuditLogPage {
  items: AuditLog[];
  total: number;
  hasMore: boolean;
}
