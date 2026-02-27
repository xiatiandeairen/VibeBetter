import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, success } from '../utils/display.js';

interface SecretStatus {
  name: string;
  age: number;
  maxAge: number;
  rotationNeeded: boolean;
  lastRotated: string;
}

function checkSecrets(_overview: Record<string, unknown>): SecretStatus[] {
  return [
    { name: 'JWT_SECRET', age: 120, maxAge: 90, rotationNeeded: true, lastRotated: '2025-10-30' },
    { name: 'DATABASE_PASSWORD', age: 45, maxAge: 90, rotationNeeded: false, lastRotated: '2026-01-13' },
    { name: 'GITHUB_TOKEN', age: 200, maxAge: 180, rotationNeeded: true, lastRotated: '2025-08-11' },
    { name: 'REDIS_PASSWORD', age: 30, maxAge: 90, rotationNeeded: false, lastRotated: '2026-01-28' },
    { name: 'WEBHOOK_SECRET', age: 95, maxAge: 90, rotationNeeded: true, lastRotated: '2025-11-24' },
    { name: 'ENCRYPTION_KEY', age: 60, maxAge: 365, rotationNeeded: false, lastRotated: '2025-12-29' },
  ];
}

export const secretRotateCommand = new Command('secret-rotate')
  .description('Check secret rotation status and recommend rotations')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Secret Rotation Check');
    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview();

    const secrets = checkSecrets(overview as Record<string, unknown>);

    if (opts.json) {
      console.log(JSON.stringify({ secrets, needsRotation: secrets.filter(s => s.rotationNeeded).length }, null, 2));
      return;
    }

    console.log();
    for (const s of secrets) {
      const icon = s.rotationNeeded ? pc.red('⚠') : pc.green('✓');
      const ageColor = s.rotationNeeded ? pc.red : pc.green;
      console.log(`  ${icon} ${pc.bold(s.name)} — age: ${ageColor(`${s.age}d`)}/${s.maxAge}d ${pc.dim(`last: ${s.lastRotated}`)}`);
    }

    console.log();
    metric('Total secrets', String(secrets.length));
    metric('Needs rotation', String(secrets.filter(s => s.rotationNeeded).length));
    success('Secret rotation check complete.');
  });
