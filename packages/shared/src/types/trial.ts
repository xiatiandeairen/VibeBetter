export type TrialTier = 'free' | 'pro-trial' | 'enterprise-trial';
export type TrialStatusValue = 'active' | 'expired' | 'converted' | 'cancelled';
export type ConversionEventType =
  | 'trial_started'
  | 'feature_used'
  | 'limit_reached'
  | 'upgrade_prompted'
  | 'checkout_started'
  | 'payment_completed'
  | 'trial_expired'
  | 'trial_extended';

export interface TrialConfig {
  id: string;
  tier: TrialTier;
  durationDays: number;
  maxProjects: number;
  maxUsers: number;
  featureFlags: string[];
  requiresCreditCard: boolean;
  autoConvertOnExpiry: boolean;
  reminderDaysBefore: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TrialStatus {
  userId: string;
  organizationId: string;
  tier: TrialTier;
  status: TrialStatusValue;
  startedAt: Date;
  expiresAt: Date;
  daysRemaining: number;
  usagePercent: number;
  featuresUsed: string[];
  convertedAt: Date | null;
  cancelledAt: Date | null;
}

export interface ConversionEvent {
  id: string;
  userId: string;
  organizationId: string;
  type: ConversionEventType;
  metadata: Record<string, unknown>;
  timestamp: Date;
  sessionId: string | null;
  source: 'app' | 'cli' | 'api' | 'email' | 'webhook';
}

export interface TrialExtension {
  trialId: string;
  originalExpiresAt: Date;
  newExpiresAt: Date;
  reason: string;
  approvedBy: string | null;
  grantedAt: Date;
}
