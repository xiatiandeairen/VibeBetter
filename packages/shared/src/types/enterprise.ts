export type SSOProvider = 'saml' | 'oidc' | 'ldap' | 'azure-ad' | 'okta' | 'google-workspace';
export type AuditAction = 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'invite';
export type DataRegionCode = 'us-east-1' | 'eu-west-1' | 'ap-southeast-1' | 'us-west-2' | 'eu-central-1';

export interface SSOConfig {
  provider: SSOProvider;
  entityId: string;
  metadataUrl: string;
  certificateFingerprint: string;
  allowedDomains: string[];
  autoProvision: boolean;
  defaultRole: string;
  groupMapping: Record<string, string>;
  enabled: boolean;
}

export interface AuditPolicy {
  id: string;
  name: string;
  retentionDays: number;
  actions: AuditAction[];
  includePayload: boolean;
  includeIpAddress: boolean;
  includeUserAgent: boolean;
  exportSchedule: string | null;
  alertOnSensitive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataRegion {
  code: DataRegionCode;
  name: string;
  provider: string;
  endpoint: string;
  isPrimary: boolean;
  replicationTargets: DataRegionCode[];
  complianceFrameworks: string[];
  latencyMs: number;
}

export interface EnterpriseConfig {
  organizationId: string;
  sso: SSOConfig;
  auditPolicy: AuditPolicy;
  dataRegion: DataRegion;
  maxUsers: number;
  maxProjects: number;
  customDomain: string | null;
  ipAllowList: string[];
  enforceMultiFactor: boolean;
  sessionTimeoutMinutes: number;
  apiRateLimitPerMinute: number;
  supportTier: 'standard' | 'priority' | 'dedicated';
  contractStartDate: Date;
  contractEndDate: Date;
  features: EnterpriseFeature[];
}

export interface EnterpriseFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  configuredAt: Date | null;
  configuredBy: string | null;
}
