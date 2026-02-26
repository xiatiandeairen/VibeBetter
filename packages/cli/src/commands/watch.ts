import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, metric, percentStr, benchmarkColor } from '../utils/display.js';

export const watchCommand = new Command('watch')
  .description('Poll metrics every 30s and show changes')
  .option('-i, --interval <seconds>', 'Poll interval in seconds', '30')
  .action(async (opts) => {
    header('Watch Mode — Live Metrics');
    const config = requireConfig();
    const client = new ApiClient(config);
    const interval = (parseInt(opts.interval, 10) || 30) * 1000;

    let prev: { psri: number | null; tdi: number | null; aiRate: number | null } | null = null;

    const poll = async () => {
      const overview = await client.getOverview().catch(() => null);
      if (!overview) {
        console.log(pc.dim(`  [${new Date().toLocaleTimeString()}] No data available`));
        return;
      }

      const delta = (curr: number | null, old: number | null): string => {
        if (curr === null || old === null) return '';
        const diff = curr - old;
        if (Math.abs(diff) < 0.001) return pc.dim(' (no change)');
        return diff > 0 ? pc.red(` (+${diff.toFixed(3)})`) : pc.green(` (${diff.toFixed(3)})`);
      };

      console.log(pc.dim(`\n  [${new Date().toLocaleTimeString()}]`));
      metric('AI Success Rate', percentStr(overview.aiSuccessRate), benchmarkColor('aiSuccessRate', overview.aiSuccessRate ?? 0));
      metric('PSRI', (overview.psriScore?.toFixed(3) ?? 'N/A') + delta(overview.psriScore, prev?.psri ?? null), benchmarkColor('psriScore', overview.psriScore ?? 0));
      metric('TDI', (overview.tdiScore?.toFixed(3) ?? 'N/A') + delta(overview.tdiScore, prev?.tdi ?? null), benchmarkColor('tdiScore', overview.tdiScore ?? 0));

      prev = { psri: overview.psriScore, tdi: overview.tdiScore, aiRate: overview.aiSuccessRate };
    };

    await poll();
    console.log(pc.dim(`\n  Polling every ${interval / 1000}s. Press Ctrl+C to stop.`));
    setInterval(poll, interval);
  });
