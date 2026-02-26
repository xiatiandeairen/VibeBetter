import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

interface PrometheusMetric {
  name: string;
  help: string;
  type: 'gauge' | 'counter' | 'histogram';
  value: number;
  labels: Record<string, string>;
}

function buildPrometheusMetrics(projectKey: string, overview: Record<string, unknown>): PrometheusMetric[] {
  const labels = { project: projectKey };
  const metrics: PrometheusMetric[] = [];

  metrics.push({ name: 'vibebetter_psri_score', help: 'Project Structural Risk Index', type: 'gauge', value: Number(overview.psriScore ?? 0), labels });
  metrics.push({ name: 'vibebetter_tdi_score', help: 'Technical Debt Index', type: 'gauge', value: Number(overview.tdiScore ?? 0), labels });
  metrics.push({ name: 'vibebetter_hotspot_files', help: 'Number of hotspot files', type: 'gauge', value: Number(overview.hotspotFiles ?? 0), labels });
  metrics.push({ name: 'vibebetter_total_files', help: 'Total files analyzed', type: 'gauge', value: Number(overview.totalFiles ?? 0), labels });
  metrics.push({ name: 'vibebetter_ai_success_rate', help: 'AI PR success rate', type: 'gauge', value: Number(overview.aiSuccessRate ?? 0), labels });
  metrics.push({ name: 'vibebetter_ai_stable_rate', help: 'AI PR stability rate', type: 'gauge', value: Number(overview.aiStableRate ?? 0), labels });
  metrics.push({ name: 'vibebetter_prs_total', help: 'Total pull requests', type: 'counter', value: Number(overview.totalPrs ?? 0), labels });
  metrics.push({ name: 'vibebetter_prs_ai', help: 'AI-assisted pull requests', type: 'counter', value: Number(overview.aiPrCount ?? 0), labels });

  return metrics;
}

function formatPrometheus(metrics: PrometheusMetric[]): string {
  const lines: string[] = [];

  for (const m of metrics) {
    lines.push(`# HELP ${m.name} ${m.help}`);
    lines.push(`# TYPE ${m.name} ${m.type}`);
    const labelPairs = Object.entries(m.labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    lines.push(`${m.name}{${labelPairs}} ${m.value}`);
  }

  return lines.join('\n');
}

export const prometheusCommand = new Command('prometheus')
  .description('Expose metrics in Prometheus format')
  .option('--json', 'Output as JSON instead of Prometheus text')
  .option('--project-key <key>', 'Custom project label')
  .action(async (opts) => {
    header('Prometheus Metrics');

    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview().catch(() => null);

    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    const data = overview as Record<string, unknown>;
    const projectKey = opts.projectKey ?? config.projectId ?? 'default';
    const metrics = buildPrometheusMetrics(projectKey, data);

    if (opts.json) {
      console.log(JSON.stringify(metrics, null, 2));
      return;
    }

    console.log(formatPrometheus(metrics));
    console.log();
    info('Pipe output to a file or serve via /metrics endpoint');
  });
