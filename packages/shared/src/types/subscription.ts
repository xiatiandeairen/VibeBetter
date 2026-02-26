export type PlanId = 'free' | 'pro' | 'enterprise';
export type BillingInterval = 'month' | 'year';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused';

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
}

export interface Subscription {
  id: string;
  userId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  interval: BillingInterval;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
}

export interface Usage {
  userId: string;
  period: { start: Date; end: Date };
  apiCalls: number;
  projects: number;
  storage: number;
  bandwidth: number;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void';
  issuedAt: Date;
  dueAt: Date;
}
