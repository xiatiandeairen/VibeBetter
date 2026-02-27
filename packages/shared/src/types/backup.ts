export interface BackupEntry {
  target: string;
  lastBackup: Date;
  size: string;
  status: 'ok' | 'stale' | 'missing' | 'failed';
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  retentionDays: number;
}

export interface BackupReport {
  id: string;
  projectId: string;
  generatedAt: Date;
  backups: BackupEntry[];
  totalTargets: number;
  healthyCount: number;
  totalSize: string;
}

export interface BackupConfig {
  targets: string[];
  defaultFrequency: 'hourly' | 'daily' | 'weekly';
  retentionDays: number;
  notifyOnFailure: boolean;
  excludeTargets: string[];
}
