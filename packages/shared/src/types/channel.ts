export type ChannelType = 'direct' | 'marketplace' | 'reseller' | 'oem' | 'referral' | 'self-serve';
export type ChannelStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface DistributionChannel {
  id: string;
  name: string;
  type: ChannelType;
  status: ChannelStatus;
  config: ChannelConfig;
  metrics: ChannelMetrics;
  partnerId: string | null;
  region: string;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChannelConfig {
  endpoint: string;
  apiKey: string;
  webhookUrl: string | null;
  customBranding: boolean;
  whiteLabel: boolean;
  commissionPercent: number;
  autoApprove: boolean;
  allowedTiers: string[];
  maxSeats: number | null;
  trialDays: number;
  billingModel: 'monthly' | 'annual' | 'usage' | 'one-time';
  currency: string;
}

export interface ChannelMetrics {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  totalRevenueCents: number;
  avgDealSizeCents: number;
  activeSubscriptions: number;
  churnRate: number;
  nps: number | null;
  lastActivityAt: Date | null;
  periodStart: Date;
  periodEnd: Date;
}

export interface ChannelPerformance {
  channelId: string;
  channelName: string;
  monthlyRevenueCents: number;
  monthlyLeads: number;
  monthlyConversions: number;
  growthPercent: number;
  rank: number;
}
