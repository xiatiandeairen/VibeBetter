export interface FeatureFlag {
  key: string;
  description: string;
  defaultValue: boolean;
  category: 'ai' | 'ui' | 'billing' | 'integration' | 'experimental';
}

export const FEATURE_FLAGS: FeatureFlag[] = [
  { key: 'enableAiAttribution', description: 'Show AI vs human code attribution', defaultValue: true, category: 'ai' },
  { key: 'enableTeamView', description: 'Enable cross-project team comparison dashboard', defaultValue: true, category: 'ui' },
  { key: 'enableBillingPortal', description: 'Show billing and subscription management', defaultValue: false, category: 'billing' },
  { key: 'enableSlackIntegration', description: 'Allow Slack webhook notifications', defaultValue: true, category: 'integration' },
  { key: 'enableJiraIntegration', description: 'Allow Jira ticket creation from risk reports', defaultValue: false, category: 'integration' },
  { key: 'enableAdvancedMetrics', description: 'Show extended PSRI dimension breakdown', defaultValue: false, category: 'experimental' },
  { key: 'enableDarkMode', description: 'Support dark mode theme', defaultValue: true, category: 'ui' },
  { key: 'enableExportPdf', description: 'Allow PDF report exports', defaultValue: false, category: 'experimental' },
  { key: 'enableWebhookDelivery', description: 'Enable outbound webhook event delivery', defaultValue: true, category: 'integration' },
  { key: 'enableAiSuggestions', description: 'Show AI-powered refactoring suggestions', defaultValue: false, category: 'ai' },
];

export type FeatureFlagKey = (typeof FEATURE_FLAGS)[number]['key'];

export function getDefaultFlags(): Record<string, boolean> {
  return Object.fromEntries(FEATURE_FLAGS.map((f) => [f.key, f.defaultValue]));
}

export function isFeatureEnabled(flags: Record<string, boolean>, key: string): boolean {
  if (key in flags) return flags[key]!;
  const def = FEATURE_FLAGS.find((f) => f.key === key);
  return def?.defaultValue ?? false;
}

export function getFlagsByCategory(category: FeatureFlag['category']): FeatureFlag[] {
  return FEATURE_FLAGS.filter((f) => f.category === category);
}
