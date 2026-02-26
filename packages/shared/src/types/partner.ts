export type PartnerTier = 'silver' | 'gold' | 'platinum';
export type PartnerStatus = 'pending' | 'active' | 'suspended' | 'revoked';
export type PartnerWebhookEventType =
  | 'partner.registered'
  | 'partner.activated'
  | 'partner.suspended'
  | 'api.call'
  | 'api.error'
  | 'api.quota_exceeded';

export interface PartnerIntegration {
  id: string;
  name: string;
  tier: PartnerTier;
  status: PartnerStatus;
  contactEmail: string;
  companyName: string;
  websiteUrl?: string;
  description?: string;
  allowedOrigins: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PartnerAPI {
  partnerId: string;
  apiKeyId: string;
  baseUrl: string;
  version: string;
  rateLimit: number;
  quotaMonthly: number;
  quotaUsed: number;
  scopes: string[];
  lastCalledAt?: Date;
  enabled: boolean;
}

export interface PartnerWebhook {
  id: string;
  partnerId: string;
  url: string;
  secret: string;
  events: PartnerWebhookEventType[];
  active: boolean;
  failureCount: number;
  lastDeliveredAt?: Date;
  createdAt: Date;
}
