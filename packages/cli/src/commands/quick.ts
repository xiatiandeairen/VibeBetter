import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';

function statusIcon(psri: number): string {
  if (psri <= 0.3) return pc.green('●');
  if (psri <= 0.6) return pc.yellow('●');
  return pc.red('●');
}

export const quickCommand = new Command('quick')
  .description('Ultra-short one-line project status')
  .option('--no-color', 'Disable colors')
  .action(async () => {
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    if (!overview) {
      console.log(pc.dim('No data — run: vibe sync'));
      return;
    }

    const psri = overview.psriScore ?? 0;
    const tdi = overview.tdiScore ?? 0;
    const aiRate = overview.aiSuccessRate ?? 0;

    const parts = [
      `${statusIcon(psri)} PSRI:${psri.toFixed(3)}`,
      `TDI:${tdi.toFixed(3)}`,
      `AI:${(aiRate * 100).toFixed(0)}%`,
      `PRs:${overview.totalPrs}`,
      `Hot:${overview.hotspotFiles}`,
    ];

    console.log(parts.join(' | '));
  });
