import { logger } from './logger.js';

export interface SecretInfo {
  name: string;
  createdAt: Date;
  maxAgeDays: number;
  provider: string;
}

export interface RotationResult {
  name: string;
  ageDays: number;
  maxAgeDays: number;
  needsRotation: boolean;
  daysUntilExpiry: number;
  urgency: 'expired' | 'urgent' | 'upcoming' | 'ok';
}

export function checkRotation(secrets: SecretInfo[], now: Date = new Date()): RotationResult[] {
  if (secrets.length === 0) {
    logger.warn('No secrets provided for rotation check');
    return [];
  }

  const results: RotationResult[] = [];

  for (const secret of secrets) {
    const ageDays = Math.floor((now.getTime() - secret.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const daysUntilExpiry = secret.maxAgeDays - ageDays;
    const needsRotation = ageDays >= secret.maxAgeDays;

    let urgency: RotationResult['urgency'];
    if (daysUntilExpiry < 0) urgency = 'expired';
    else if (daysUntilExpiry < 7) urgency = 'urgent';
    else if (daysUntilExpiry < 30) urgency = 'upcoming';
    else urgency = 'ok';

    results.push({ name: secret.name, ageDays, maxAgeDays: secret.maxAgeDays, needsRotation, daysUntilExpiry, urgency });
  }

  results.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  logger.info({ total: secrets.length, needsRotation: results.filter(r => r.needsRotation).length }, 'Secret rotation check complete');
  return results;
}
