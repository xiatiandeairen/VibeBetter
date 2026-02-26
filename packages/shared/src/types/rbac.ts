export type ResourceType = 'project' | 'team' | 'organization' | 'report' | 'decision' | 'api_key' | 'webhook';
export type ActionType = 'create' | 'read' | 'update' | 'delete' | 'execute' | 'manage' | 'export';
export type PermissionEffect = 'allow' | 'deny';

export interface DetailedPermission {
  id: string;
  resource: ResourceType;
  action: ActionType;
  effect: PermissionEffect;
  conditions?: PermissionCondition[];
  description: string;
}

export interface PermissionCondition {
  field: string;
  operator: 'eq' | 'neq' | 'in' | 'not_in' | 'gt' | 'lt' | 'contains';
  value: unknown;
}

export interface RoleBinding {
  id: string;
  roleId: string;
  roleName: string;
  principalId: string;
  principalType: 'user' | 'team' | 'service_account';
  scope: RoleScope;
  permissions: DetailedPermission[];
  grantedAt: Date;
  grantedBy: string;
  expiresAt?: Date;
}

export interface RoleScope {
  organizationId?: string;
  projectId?: string;
  teamId?: string;
}

export interface PermissionCheck {
  principalId: string;
  resource: ResourceType;
  resourceId: string;
  action: ActionType;
  context: Record<string, unknown>;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason: string;
  matchedPermissions: DetailedPermission[];
  evaluatedAt: Date;
}
