export interface PricingTier {
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    projects: number;
    users: number;
    apiCalls: number;
  };
}

export const PRICING_TIERS: Record<string, PricingTier> = {
  free: {
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      'Up to 2 projects',
      'Basic PSRI metrics',
      'Weekly digest emails',
      'Community support',
    ],
    limits: { projects: 2, users: 1, apiCalls: 1000 },
  },
  pro: {
    name: 'Pro',
    price: 29,
    interval: 'month',
    features: [
      'Unlimited projects',
      'Full PSRI + TDI metrics',
      'AI attribution analysis',
      'CLI access',
      'Custom decision rules',
      'Priority support',
    ],
    limits: { projects: -1, users: 10, apiCalls: 50000 },
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    interval: 'month',
    features: [
      'Everything in Pro',
      'SSO / SAML',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'On-premise option',
      'Audit logs',
      'White-label branding',
    ],
    limits: { projects: -1, users: -1, apiCalls: -1 },
  },
} as const;
