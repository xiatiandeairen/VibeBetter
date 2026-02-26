export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'execute' | 'manage' | 'export' | 'share';
export type ResourceType = 'project' | 'report' | 'metric' | 'decision' | 'collection' | 'team' | 'organization' | 'api_key' | 'webhook' | 'setting';
export type PolicyEffect = 'allow' | 'deny';
export type ScopeLevel = 'global' | 'organization' | 'team' | 'project' | 'resource';

export interface Permission {
  id: string;
  name: string;
  description: string;
  action: PermissionAction;
  resourceType: ResourceType;
  conditions: PermissionCondition[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains' | 'starts_with' | 'gt' | 'lt' | 'gte' | 'lte';
  value: string | number | boolean | string[];
}

export interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  effect: PolicyEffect;
  principals: PolicyPrincipal[];
  permissions: Permission[];
  resources: ResourceScope[];
  priority: number;
  enabled: boolean;
  validFrom: Date | null;
  validUntil: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PolicyPrincipal {
  type: 'user' | 'group' | 'role' | 'service_account';
  id: string;
  name: string;
  attributes: Record<string, string>;
}

export interface ResourceScope {
  level: ScopeLevel;
  resourceType: ResourceType;
  resourceId: string | null;
  includeChildren: boolean;
  conditions: PermissionCondition[];
}

export interface AccessDecision {
  allowed: boolean;
  matchedPolicies: string[];
  deniedBy: string | null;
  evaluatedAt: Date;
  principal: PolicyPrincipal;
  action: PermissionAction;
  resource: ResourceScope;
  reason: string;
}

export interface AccessAuditEntry {
  id: string;
  decision: AccessDecision;
  requestContext: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}
