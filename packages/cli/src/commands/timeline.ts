import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

interface TimelinePoint {
  date: string;
  value: number;
}

const CHART_HEIGHT = 10;
const CHART_WIDTH = 40;

function renderAsciiChart(points: TimelinePoint[], label: string): string {
  if (points.length === 0) return '  No data';

  const values = points.map((p) => p.value);
  const max = Math.max(...values, 0.001);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const lines: string[] = [];
  lines.push(`  ${pc.bold(label)}`);
  lines.push(`  ${pc.dim(`max: ${max.toFixed(2)}`)}`);

  const cols = Math.min(points.length, CHART_WIDTH);
  const step = Math.max(1, Math.floor(points.length / cols));
  const sampled = points.filter((_, i) => i % step === 0).slice(0, cols);

  for (let row = CHART_HEIGHT; row >= 1; row--) {
    const threshold = min + (range * row) / CHART_HEIGHT;
    let line = '  │';
    for (const p of sampled) {
      if (p.value >= threshold) {
        line += pc.cyan('█');
      } else {
        line += ' ';
      }
    }
    lines.push(line);
  }

  lines.push('  └' + '─'.repeat(sampled.length));
  const firstDate = sampled[0]?.date.slice(5, 10) ?? '';
  const lastDate = sampled[sampled.length - 1]?.date.slice(5, 10) ?? '';
  const padding = Math.max(0, sampled.length - firstDate.length - lastDate.length);
  lines.push(`   ${pc.dim(firstDate)}${' '.repeat(padding)}${pc.dim(lastDate)}`);
  lines.push(`  ${pc.dim(`min: ${min.toFixed(2)}`)}`);

  return lines.join('\n');
}

export const timelineCommand = new Command('timeline')
  .description('Show project metric timeline as ASCII chart')
  .option('--metric <name>', 'Metric to chart: psri, tdi, aiSuccess', 'psri')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    header('Metric Timeline');
    const config = requireConfig();
    const client = new ApiClient(config);

    const overview = await client.getOverview().catch(() => null);
    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    const snapshots = await client.getSnapshots(50).catch(() => null);
    const snapshotList = snapshots ?? [];
    const metricName = opts.metric as string;

    const points: TimelinePoint[] = snapshotList.map((s) => ({
      date: s.snapshotDate,
      value: metricName === 'tdi' ? (s.tdiScore ?? 0) : metricName === 'aiSuccess' ? (s.aiSuccessRate ?? 0) : (s.psriScore ?? 0),
    }));

    if (opts.json) {
      console.log(JSON.stringify({ metric: metricName, points }, null, 2));
      return;
    }

    if (points.length === 0) {
      info('No snapshot history. Run vibe sync multiple times to build history.');
      return;
    }

    console.log(renderAsciiChart(points, `${metricName.toUpperCase()} over time`));
    console.log();
    info(`Showing ${points.length} data point(s) for "${metricName}"`);
  });
