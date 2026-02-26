import { logger } from './logger.js';

export type FeatureState = 'enabled' | 'disabled' | 'percentage' | 'allowlist';

export interface FeatureToggleConfig {
  name: string;
  state: FeatureState;
  percentage?: number;
  allowlist?: string[];
  description?: string;
}

export interface FeatureToggleResult {
  feature: string;
  enabled: boolean;
  reason: string;
}

const ENV_PREFIX = 'FEATURE_';

function envKey(featureName: string): string {
  return `${ENV_PREFIX}${featureName.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
}

export function isFeatureEnabled(featureName: string, userId?: string): FeatureToggleResult {
  const key = envKey(featureName);
  const value = process.env[key];

  if (value === undefined) {
    return { feature: featureName, enabled: false, reason: `env ${key} not set` };
  }

  const lower = value.toLowerCase().trim();

  if (lower === 'true' || lower === '1' || lower === 'enabled') {
    return { feature: featureName, enabled: true, reason: 'env enabled' };
  }

  if (lower === 'false' || lower === '0' || lower === 'disabled') {
    return { feature: featureName, enabled: false, reason: 'env disabled' };
  }

  const percentMatch = lower.match(/^(\d+)%$/);
  if (percentMatch?.[1]) {
    const pct = parseInt(percentMatch[1], 10);
    const hash = simpleHash(userId ?? 'anonymous');
    const enabled = (hash % 100) < pct;
    return { feature: featureName, enabled, reason: `percentage rollout ${pct}%` };
  }

  if (lower.includes(',')) {
    const allowlist = lower.split(',').map((s) => s.trim());
    const enabled = userId ? allowlist.includes(userId) : false;
    return { feature: featureName, enabled, reason: `allowlist (${allowlist.length} entries)` };
  }

  return { feature: featureName, enabled: false, reason: `unrecognized value: ${value}` };
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getAllFeatureToggles(): FeatureToggleResult[] {
  const results: FeatureToggleResult[] = [];
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith(ENV_PREFIX) && value !== undefined) {
      const name = key.slice(ENV_PREFIX.length).toLowerCase().replace(/_/g, '-');
      results.push(isFeatureEnabled(name));
    }
  }
  return results;
}

export function logFeatureAccess(featureName: string, result: FeatureToggleResult): void {
  logger.info({ feature: featureName, enabled: result.enabled, reason: result.reason }, `Feature toggle: ${featureName}`);
}
