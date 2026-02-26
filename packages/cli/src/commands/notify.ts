import { Command } from 'commander';
import pc from 'picocolors';
import * as fs from 'node:fs';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

type NotifyTarget = 'stdout' | 'file' | 'webhook';

interface AlertPayload {
  project: string;
  timestamp: string;
  psri: number;
  tdi: number;
  aiSuccessRate: number;
  hotspots: number;
  alerts: string[];
}

function buildAlerts(psri: number, tdi: number, aiRate: number, hotspots: number): string[] {
  const alerts: string[] = [];
  if (psri > 0.7) alerts.push(`CRITICAL: PSRI at ${psri.toFixed(3)} exceeds 0.7 threshold`);
  else if (psri > 0.5) alerts.push(`WARNING: PSRI at ${psri.toFixed(3)} above 0.5`);
  if (tdi > 0.6) alerts.push(`CRITICAL: TDI at ${tdi.toFixed(3)} exceeds 0.6 threshold`);
  else if (tdi > 0.4) alerts.push(`WARNING: TDI at ${tdi.toFixed(3)} above 0.4`);
  if (aiRate < 0.5) alerts.push(`WARNING: AI Success Rate at ${(aiRate * 100).toFixed(0)}% below 50%`);
  if (hotspots > 10) alerts.push(`WARNING: ${hotspots} hotspot files detected`);
  return alerts;
}

async function sendWebhook(url: string, payload: AlertPayload): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export const notifyCommand = new Command('notify')
  .description('Send metric alert to stdout, file, or webhook')
  .option('--target <target>', 'Notification target: stdout, file, webhook', 'stdout')
  .option('--file <path>', 'File path for file target')
  .option('--webhook <url>', 'Webhook URL for webhook target')
  .option('--only-alerts', 'Only notify if there are alerts')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Notify');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    const psri = overview.psriScore ?? 0;
    const tdi = overview.tdiScore ?? 0;
    const aiRate = overview.aiSuccessRate ?? 0;
    const hotspots = overview.hotspotFiles ?? 0;

    const alerts = buildAlerts(psri, tdi, aiRate, hotspots);

    if (opts.onlyAlerts && alerts.length === 0) {
      console.log(pc.green('  ✓ No alerts — all metrics within thresholds'));
      return;
    }

    const payload: AlertPayload = {
      project: config.projectId ?? 'unknown',
      timestamp: new Date().toISOString(),
      psri,
      tdi,
      aiSuccessRate: aiRate,
      hotspots,
      alerts,
    };

    const target: NotifyTarget = opts.target as NotifyTarget;

    switch (target) {
      case 'file': {
        const filePath = opts.file ?? 'vibe-alerts.json';
        fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
        console.log(pc.green(`  ✓ Alert written to ${filePath}`));
        break;
      }
      case 'webhook': {
        if (!opts.webhook) {
          console.log(pc.red('  Missing --webhook <url>'));
          return;
        }
        const ok = await sendWebhook(opts.webhook, payload);
        if (ok) console.log(pc.green('  ✓ Webhook delivered'));
        else console.log(pc.red('  ✗ Webhook delivery failed'));
        break;
      }
      case 'stdout':
      default: {
        if (opts.json) {
          console.log(JSON.stringify(payload, null, 2));
        } else {
          if (alerts.length > 0) {
            console.log(pc.bold(`  ${alerts.length} Alert(s)\n`));
            for (const a of alerts) {
              const icon = a.startsWith('CRITICAL') ? pc.red('🔴') : pc.yellow('🟡');
              console.log(`  ${icon} ${a}`);
            }
          } else {
            console.log(pc.green('  ✓ All metrics within thresholds'));
          }
          console.log();
        }
      }
    }
  });
