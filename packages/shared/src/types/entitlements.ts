export type EntitlementStatus = 'active' | 'expired' | 'pending' | 'revoked';
export type GateAction = 'allow' | 'deny' | 'soft_limit';

export interface Entitlement {
  id: string;
  organizationId: string;
  featureKey: string;
  status: EntitlementStatus;
  quantity?: number;
  usedQuantity: number;
  grantedAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface FeatureGate {
  featureKey: string;
  displayName: string;
  description: string;
  action: GateAction;
  tiers: string[];
  defaultEnabled: boolean;
  overrides?: Record<string, boolean>;
}

export interface UsageLimit {
  featureKey: string;
  organizationId: string;
  limitType: 'hard' | 'soft';
  maxValue: number;
  currentValue: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  resetAt: Date;
  warningThreshold: number;
  notifiedAt?: Date;
}
