export interface SecretEntry {
  name: string;
  ageDays: number;
  maxAgeDays: number;
  rotationNeeded: boolean;
  lastRotated: Date;
  rotationPolicy: 'manual' | 'automatic';
  provider: string;
}

export interface SecretManagementReport {
  id: string;
  projectId: string;
  generatedAt: Date;
  secrets: SecretEntry[];
  totalSecrets: number;
  needsRotation: number;
  complianceRate: number;
}

export interface SecretManagementConfig {
  defaultMaxAge: number;
  rotationWarningDays: number;
  providers: string[];
  excludeSecrets: string[];
  autoRotate: boolean;
}
