import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

interface DatadogMetric {
  metric: string;
  type: 'gauge' | 'count' | 'rate';
  points: Array<[number, number]>;
  tags: string[];
}

interface DatadogPayload {
  series: DatadogMetric[];
}

function buildDatadogPayload(projectKey: string, overview: Record<string, unknown>): DatadogPayload {
  const ts = Math.floor(Date.now() / 1000);
  const tags = [`project:${projectKey}`, 'source:vibebetter'];
  const series: DatadogMetric[] = [];

  const metricMap: Array<{ key: string; name: string; type: 'gauge' | 'count' }> = [
    { key: 'psriScore', name: 'vibebetter.psri', type: 'gauge' },
    { key: 'tdiScore', name: 'vibebetter.tdi', type: 'gauge' },
    { key: 'hotspotFiles', name: 'vibebetter.hotspots', type: 'gauge' },
    { key: 'totalFiles', name: 'vibebetter.files.total', type: 'gauge' },
    { key: 'aiSuccessRate', name: 'vibebetter.ai.success_rate', type: 'gauge' },
    { key: 'aiStableRate', name: 'vibebetter.ai.stable_rate', type: 'gauge' },
    { key: 'totalPrs', name: 'vibebetter.prs.total', type: 'count' },
    { key: 'aiPrCount', name: 'vibebetter.prs.ai', type: 'count' },
  ];

  for (const m of metricMap) {
    const value = Number(overview[m.key] ?? 0);
    if (value !== 0 || m.key === 'psriScore' || m.key === 'tdiScore') {
      series.push({ metric: m.name, type: m.type, points: [[ts, value]], tags });
    }
  }

  return { series };
}

export const datadogCommand = new Command('datadog')
  .description('Format metrics for Datadog custom metrics API')
  .option('--json', 'Output as raw JSON')
  .option('--project-key <key>', 'Custom project key tag')
  .option('--prefix <prefix>', 'Metric name prefix', 'vibebetter')
  .action(async (opts) => {
    header('Datadog Metrics');

    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview().catch(() => null);

    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    const data = overview as Record<string, unknown>;
    const projectKey = opts.projectKey ?? config.projectId ?? 'default';
    const payload = buildDatadogPayload(projectKey, data);

    if (opts.prefix !== 'vibebetter') {
      for (const s of payload.series) {
        s.metric = s.metric.replace('vibebetter', opts.prefix);
      }
    }

    if (opts.json) {
      console.log(JSON.stringify(payload, null, 2));
      return;
    }

    console.log(pc.bold('  Datadog Custom Metrics\n'));
    console.log(`  ${pc.dim('Project:')} ${projectKey}`);
    console.log(`  ${pc.dim('Series:')}  ${payload.series.length} metric(s)`);
    console.log();

    for (const s of payload.series) {
      const value = s.points[0]?.[1] ?? 0;
      console.log(`  ${pc.dim(s.type.padEnd(6))} ${pc.cyan(s.metric.padEnd(35))} ${value}`);
    }

    console.log();
    info('Use --json to POST to https://api.datadoghq.com/api/v1/series');
  });
