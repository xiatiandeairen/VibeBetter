export type RetentionAction = 'archive' | 'delete' | 'anonymize' | 'encrypt';
export type DataSensitivity = 'public' | 'internal' | 'confidential' | 'restricted';
export type RetentionPeriod = '30d' | '90d' | '180d' | '1y' | '3y' | '5y' | '7y' | 'indefinite';
export type ComplianceFramework = 'gdpr' | 'ccpa' | 'hipaa' | 'sox' | 'pci-dss' | 'custom';

export interface RetentionPolicy {
  id: string;
  name: string;
  description: string;
  classification: DataClassification;
  retentionPeriod: RetentionPeriod;
  action: RetentionAction;
  appliesTo: RetentionScope[];
  complianceFrameworks: ComplianceFramework[];
  enabled: boolean;
  lastExecutedAt: Date | null;
  nextExecutionAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataClassification {
  id: string;
  label: string;
  sensitivity: DataSensitivity;
  description: string;
  requiresEncryption: boolean;
  requiresAuditLog: boolean;
  piiContained: boolean;
  crossBorderRestriction: boolean;
  handlers: string[];
}

export interface RetentionScope {
  entityType: 'project' | 'user' | 'organization' | 'metric' | 'audit_log' | 'api_log';
  filter: Record<string, unknown>;
  includeArchived: boolean;
}

export interface RetentionExecution {
  id: string;
  policyId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  recordsProcessed: number;
  recordsDeleted: number;
  recordsArchived: number;
  recordsAnonymized: number;
  startedAt: Date;
  completedAt: Date | null;
  error: string | null;
  durationMs: number;
}

export interface DataInventoryItem {
  entityType: string;
  classification: DataClassification;
  recordCount: number;
  oldestRecord: Date;
  newestRecord: Date;
  storageBytes: number;
  retentionPolicy: RetentionPolicy | null;
  compliant: boolean;
}
