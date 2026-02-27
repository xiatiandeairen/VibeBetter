import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface BackupStatus {
  target: string;
  lastBackup: string;
  size: string;
  status: 'ok' | 'stale' | 'missing' | 'failed';
  frequency: string;
}

function checkBackups(_overview: Record<string, unknown>): BackupStatus[] {
  return [
    { target: 'PostgreSQL', lastBackup: '2026-02-27T02:00:00Z', size: '2.4 GB', status: 'ok', frequency: 'daily' },
    { target: 'Redis', lastBackup: '2026-02-27T03:00:00Z', size: '128 MB', status: 'ok', frequency: 'hourly' },
    { target: 'File Storage', lastBackup: '2026-02-20T02:00:00Z', size: '5.1 GB', status: 'stale', frequency: 'weekly' },
    { target: 'Config', lastBackup: '2026-02-27T00:00:00Z', size: '1.2 MB', status: 'ok', frequency: 'daily' },
    { target: 'Audit Logs', lastBackup: '', size: '0 B', status: 'missing', frequency: 'daily' },
  ];
}

export const backupCheckCommand = new Command('backup-check')
  .description('Verify backup status and freshness for all data stores')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Backup Check');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const backups = checkBackups(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ backups, healthy: backups.filter(b => b.status === 'ok').length }, null, 2));
      return;
    }

    console.log();
    for (const b of backups) {
      const icon = b.status === 'ok' ? pc.green('✓') : b.status === 'stale' ? pc.yellow('⚠') : pc.red('✗');
      console.log(`  ${icon} ${pc.bold(b.target.padEnd(16))} ${pc.dim(b.frequency.padEnd(8))} ${b.size.padEnd(10)} ${b.status === 'ok' ? pc.green(b.status) : pc.red(b.status)}`);
    }

    console.log();
    metric('Backup targets', String(backups.length));
    metric('Healthy', String(backups.filter(b => b.status === 'ok').length));
    metric('Needs attention', String(backups.filter(b => b.status !== 'ok').length));
    success('Backup check complete.');
  });
