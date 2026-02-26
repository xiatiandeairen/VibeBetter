export type TenantStatus = 'active' | 'suspended' | 'trial' | 'deactivated';
export type TenantPlan = 'free' | 'starter' | 'pro' | 'enterprise' | 'custom';
export type IsolationLevel = 'shared' | 'dedicated' | 'isolated';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  plan: TenantPlan;
  ownerId: string;
  domain: string | null;
  logoUrl: string | null;
  settings: TenantSettings;
  quota: TenantQuota;
  isolation: IsolationLevel;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  trialEndsAt: Date | null;
  suspendedAt: Date | null;
  suspendedReason: string | null;
}

export interface TenantSettings {
  branding: TenantBranding;
  security: TenantSecurity;
  features: Record<string, boolean>;
  defaults: TenantDefaults;
  notifications: TenantNotificationSettings;
}

export interface TenantBranding {
  primaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  appName: string | null;
  supportEmail: string | null;
}

export interface TenantSecurity {
  mfaRequired: boolean;
  ssoEnabled: boolean;
  ssoProvider: string | null;
  ipWhitelist: string[];
  sessionTimeoutMinutes: number;
  passwordPolicy: PasswordPolicy;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  maxAgeDays: number;
}

export interface TenantDefaults {
  timezone: string;
  locale: string;
  dateFormat: string;
  defaultProjectVisibility: 'private' | 'internal' | 'public';
}

export interface TenantNotificationSettings {
  emailEnabled: boolean;
  slackEnabled: boolean;
  webhookEnabled: boolean;
  digestFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface TenantQuota {
  maxUsers: number;
  maxProjects: number;
  maxApiCallsPerDay: number;
  maxStorageMb: number;
  maxWebhooks: number;
  maxIntegrations: number;
  currentUsers: number;
  currentProjects: number;
  currentStorageMb: number;
}

export interface TenantUsageSummary {
  tenantId: string;
  period: string;
  apiCalls: number;
  activeUsers: number;
  projectsAnalyzed: number;
  storageUsedMb: number;
  computeMinutes: number;
}
