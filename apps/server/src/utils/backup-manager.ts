import { logger } from './logger.js';

export interface BackupTarget {
  name: string;
  lastBackup: Date | null;
  frequency: 'hourly' | 'daily' | 'weekly';
  sizeBytes: number;
  retentionDays: number;
}

export interface BackupCheckResult {
  target: string;
  status: 'ok' | 'stale' | 'missing' | 'overdue';
  hoursSinceBackup: number | null;
  expectedHours: number;
  sizeFormatted: string;
}

function formatSize(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB`;
  return `${bytes} B`;
}

export function checkBackups(targets: BackupTarget[], now: Date = new Date()): BackupCheckResult[] {
  if (targets.length === 0) {
    logger.warn('No backup targets provided');
    return [];
  }

  const frequencyHours = { hourly: 1, daily: 24, weekly: 168 };
  const results: BackupCheckResult[] = [];

  for (const t of targets) {
    const expectedHours = frequencyHours[t.frequency];

    if (!t.lastBackup) {
      results.push({ target: t.name, status: 'missing', hoursSinceBackup: null, expectedHours, sizeFormatted: formatSize(t.sizeBytes) });
      continue;
    }

    const hoursSince = Math.round((now.getTime() - t.lastBackup.getTime()) / (1000 * 60 * 60));
    let status: BackupCheckResult['status'];
    if (hoursSince <= expectedHours) status = 'ok';
    else if (hoursSince <= expectedHours * 2) status = 'stale';
    else status = 'overdue';

    results.push({ target: t.name, status, hoursSinceBackup: hoursSince, expectedHours, sizeFormatted: formatSize(t.sizeBytes) });
  }

  logger.info({ targets: targets.length, healthy: results.filter(r => r.status === 'ok').length }, 'Backup check complete');
  return results;
}
