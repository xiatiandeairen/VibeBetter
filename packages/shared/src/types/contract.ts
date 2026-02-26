export type ContractStatus = 'draft' | 'active' | 'expired' | 'terminated' | 'renewed';
export type SLAPriority = 'critical' | 'high' | 'medium' | 'low';
export type EscalationLevel = 'L1' | 'L2' | 'L3' | 'executive';

export interface SLATerms {
  id: string;
  name: string;
  priority: SLAPriority;
  responseTimeMinutes: number;
  resolutionTimeMinutes: number;
  uptimePercentage: number;
  maintenanceWindowHours: number;
  supportHoursStart: string;
  supportHoursEnd: string;
  supportDays: string[];
  penaltyPercent: number;
  creditEligible: boolean;
}

export interface EscalationPolicy {
  id: string;
  name: string;
  levels: EscalationStep[];
  autoEscalateOnBreach: boolean;
  notifyOnEscalation: boolean;
  cooldownMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EscalationStep {
  level: EscalationLevel;
  triggerAfterMinutes: number;
  assignees: string[];
  notificationChannels: string[];
  requiresAcknowledgement: boolean;
}

export interface ServiceContract {
  id: string;
  organizationId: string;
  name: string;
  status: ContractStatus;
  tier: 'free' | 'pro' | 'enterprise';
  slaTerms: SLATerms;
  escalationPolicy: EscalationPolicy;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  monthlyValueCents: number;
  currency: string;
  signedBy: string;
  signedAt: Date | null;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractSummary {
  totalContracts: number;
  activeContracts: number;
  totalMonthlyRevenueCents: number;
  avgUptimePercent: number;
  breachCount: number;
  renewalRate: number;
}
