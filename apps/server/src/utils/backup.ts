import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from './logger.js';

export interface BackupConfig {
  databaseUrl: string;
  outputDir: string;
  compress: boolean;
  maxBackups: number;
  prefix: string;
}

export interface BackupResult {
  success: boolean;
  filePath: string | null;
  sizeBytes: number;
  durationMs: number;
  timestamp: Date;
  error: string | null;
}

const DEFAULT_CONFIG: BackupConfig = {
  databaseUrl: process.env['DATABASE_URL'] ?? 'postgresql://localhost:5432/vibebetter',
  outputDir: './backups',
  compress: true,
  maxBackups: 10,
  prefix: 'vibebetter',
};

function buildFilename(prefix: string, compress: boolean): string {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const ext = compress ? 'sql.gz' : 'sql';
  return `${prefix}_${ts}.${ext}`;
}

export function triggerBackup(config: Partial<BackupConfig> = {}): BackupResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const start = Date.now();

  if (!existsSync(cfg.outputDir)) {
    mkdirSync(cfg.outputDir, { recursive: true });
  }

  const filename = buildFilename(cfg.prefix, cfg.compress);
  const filePath = join(cfg.outputDir, filename);

  try {
    const pgDumpCmd = cfg.compress
      ? `pg_dump "${cfg.databaseUrl}" | gzip > "${filePath}"`
      : `pg_dump "${cfg.databaseUrl}" -f "${filePath}"`;

    execSync(pgDumpCmd, { stdio: 'pipe', timeout: 300_000 });

    const { statSync } = require('node:fs') as typeof import('node:fs');
    const stats = statSync(filePath);

    const result: BackupResult = {
      success: true,
      filePath,
      sizeBytes: stats.size,
      durationMs: Date.now() - start,
      timestamp: new Date(),
      error: null,
    };

    logger.info({ filePath, sizeBytes: result.sizeBytes, durationMs: result.durationMs }, 'Backup completed');
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ error: message }, 'Backup failed');
    return {
      success: false,
      filePath: null,
      sizeBytes: 0,
      durationMs: Date.now() - start,
      timestamp: new Date(),
      error: message,
    };
  }
}

export function pruneOldBackups(config: Partial<BackupConfig> = {}): number {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  if (!existsSync(cfg.outputDir)) return 0;

  const { readdirSync, unlinkSync, statSync } = require('node:fs') as typeof import('node:fs');
  const files = readdirSync(cfg.outputDir)
    .filter((f: string) => f.startsWith(cfg.prefix) && (f.endsWith('.sql') || f.endsWith('.sql.gz')))
    .map((f: string) => ({ name: f, time: statSync(join(cfg.outputDir, f)).mtime.getTime() }))
    .sort((a: { time: number }, b: { time: number }) => b.time - a.time);

  let removed = 0;
  for (let i = cfg.maxBackups; i < files.length; i++) {
    const file = files[i];
    if (!file) continue;
    unlinkSync(join(cfg.outputDir, file.name));
    removed++;
  }

  if (removed > 0) {
    logger.info({ removed }, 'Old backups pruned');
  }

  return removed;
}

export function getBackupStatus(config: Partial<BackupConfig> = {}): { count: number; totalSizeBytes: number; latestFile: string | null } {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  if (!existsSync(cfg.outputDir)) {
    return { count: 0, totalSizeBytes: 0, latestFile: null };
  }

  const { readdirSync, statSync } = require('node:fs') as typeof import('node:fs');
  const files = readdirSync(cfg.outputDir)
    .filter((f: string) => f.startsWith(cfg.prefix))
    .sort()
    .reverse();

  let totalSize = 0;
  for (const f of files) {
    totalSize += statSync(join(cfg.outputDir, f)).size;
  }

  return { count: files.length, totalSizeBytes: totalSize, latestFile: files[0] ?? null };
}
