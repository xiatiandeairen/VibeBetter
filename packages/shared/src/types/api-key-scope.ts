export type ScopeLevel = 'read' | 'write' | 'admin';
export type ApiKeyStatus = 'active' | 'revoked' | 'expired';

export interface ScopedPermission {
  resource: string;
  actions: string[];
  level: ScopeLevel;
  projectIds?: string[];
  rateLimit?: number;
}

export interface ApiKeyScope {
  id: string;
  name: string;
  description: string;
  permissions: ScopedPermission[];
  ipWhitelist?: string[];
  allowedOrigins?: string[];
  maxRequestsPerHour: number;
  maxRequestsPerDay: number;
}

export interface ScopedApiKey {
  id: string;
  keyHash: string;
  prefix: string;
  label: string;
  userId: string;
  organizationId?: string;
  scope: ApiKeyScope;
  status: ApiKeyStatus;
  lastUsedAt?: Date;
  usageCount: number;
  createdAt: Date;
  expiresAt?: Date;
  revokedAt?: Date;
  revokedBy?: string;
}

export interface ApiKeyScopeValidation {
  valid: boolean;
  missingPermissions: string[];
  exceededLimits: string[];
}
