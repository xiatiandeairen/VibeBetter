import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

function shieldsUrl(label: string, value: string, color: string): string {
  const l = encodeURIComponent(label);
  const v = encodeURIComponent(value);
  return `https://img.shields.io/badge/${l}-${v}-${color}`;
}

export const badgeCommand = new Command('badge')
  .description('Generate markdown badges for README')
  .option('--metric <name>', 'Specific metric (psri, tdi, ai-success)', 'psri')
  .action(async (opts) => {
    header('Badge Generator');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    const badges: Array<{ label: string; value: string; color: string }> = [];

    if (opts.metric === 'psri' || opts.metric === 'all') {
      const v = overview.psriScore;
      const color = v === null ? 'lightgrey' : v <= 0.3 ? 'brightgreen' : v <= 0.6 ? 'yellow' : 'red';
      badges.push({ label: 'PSRI', value: v?.toFixed(3) ?? 'N/A', color });
    }
    if (opts.metric === 'tdi' || opts.metric === 'all') {
      const v = overview.tdiScore;
      const color = v === null ? 'lightgrey' : v <= 0.3 ? 'brightgreen' : v <= 0.6 ? 'yellow' : 'red';
      badges.push({ label: 'TDI', value: v?.toFixed(3) ?? 'N/A', color });
    }
    if (opts.metric === 'ai-success' || opts.metric === 'all') {
      const v = overview.aiSuccessRate;
      const color = v === null ? 'lightgrey' : v >= 0.85 ? 'brightgreen' : v >= 0.7 ? 'yellow' : 'red';
      badges.push({ label: 'AI Success', value: v ? `${(v * 100).toFixed(1)}%` : 'N/A', color });
    }

    if (badges.length === 0) {
      badges.push({
        label: 'PSRI',
        value: overview.psriScore?.toFixed(3) ?? 'N/A',
        color: (overview.psriScore ?? 1) <= 0.3 ? 'brightgreen' : 'yellow',
      });
    }

    console.log(pc.bold('  Markdown badges:\n'));
    for (const b of badges) {
      const url = shieldsUrl(b.label, b.value, b.color);
      const md = `![${b.label}](${url})`;
      console.log(`  ${md}`);
    }
    console.log(pc.dim('\n  Copy and paste into your README.md'));
  });
