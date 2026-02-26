export type LicenseTier = 'community' | 'professional' | 'enterprise' | 'trial';
export type LicenseStatus = 'active' | 'expired' | 'revoked' | 'suspended';

export interface LicenseKey {
  id: string;
  key: string;
  organizationId: string;
  tier: LicenseTier;
  status: LicenseStatus;
  seats: number;
  seatsUsed: number;
  features: string[];
  issuedAt: Date;
  expiresAt: Date;
  lastValidatedAt?: Date;
}

export interface LicenseValidation {
  valid: boolean;
  tier: LicenseTier;
  remainingDays: number;
  seatsAvailable: number;
  features: string[];
  warnings: string[];
  checkedAt: Date;
}

export interface LicenseUsage {
  licenseId: string;
  period: string;
  activeUsers: number;
  apiCalls: number;
  snapshotsCreated: number;
  storageUsedMb: number;
  recordedAt: Date;
}
