import { Command } from 'commander';
import pc from 'picocolors';
import { requireConfig } from '../config.js';
import { ApiClient } from '../api-client.js';
import { header, info } from '../utils/display.js';

interface OtelSpan {
  traceId: string;
  spanId: string;
  name: string;
  kind: 'INTERNAL' | 'CLIENT';
  startTimeUnixNano: string;
  endTimeUnixNano: string;
  attributes: Array<{ key: string; value: { stringValue?: string; intValue?: number; doubleValue?: number } }>;
}

function generateTraceId(): string {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateSpanId(): string {
  const bytes = new Uint8Array(8);
  for (let i = 0; i < 8; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function buildSpans(projectKey: string, overview: Record<string, unknown>): OtelSpan[] {
  const traceId = generateTraceId();
  const now = Date.now();
  const spans: OtelSpan[] = [];

  const metrics: Array<[string, number]> = [
    ['vibebetter.psri_score', Number(overview.psriScore ?? 0)],
    ['vibebetter.tdi_score', Number(overview.tdiScore ?? 0)],
    ['vibebetter.hotspot_files', Number(overview.hotspotFiles ?? 0)],
    ['vibebetter.total_files', Number(overview.totalFiles ?? 0)],
    ['vibebetter.ai_success_rate', Number(overview.aiSuccessRate ?? 0)],
    ['vibebetter.ai_stable_rate', Number(overview.aiStableRate ?? 0)],
    ['vibebetter.total_prs', Number(overview.totalPrs ?? 0)],
    ['vibebetter.ai_prs', Number(overview.aiPrCount ?? overview.aiPrs ?? 0)],
  ];

  for (const [name, value] of metrics) {
    spans.push({
      traceId,
      spanId: generateSpanId(),
      name: `metric.${name}`,
      kind: 'INTERNAL',
      startTimeUnixNano: String(now * 1_000_000),
      endTimeUnixNano: String((now + 1) * 1_000_000),
      attributes: [
        { key: 'project', value: { stringValue: projectKey } },
        { key: 'metric.name', value: { stringValue: name } },
        { key: 'metric.value', value: { doubleValue: value } },
      ],
    });
  }

  return spans;
}

export const opentelemetryCommand = new Command('opentelemetry')
  .description('Export metrics as OpenTelemetry spans')
  .option('--json', 'Output as JSON (OTLP format)')
  .option('--project-key <key>', 'Custom project label')
  .option('--endpoint <url>', 'OTLP HTTP endpoint to POST spans to')
  .action(async (opts) => {
    header('OpenTelemetry Export');

    const config = requireConfig();
    const client = new ApiClient(config);
    const overview = await client.getOverview().catch(() => null);

    if (!overview) {
      info('No metrics available. Run: vibe sync');
      return;
    }

    const data = overview as Record<string, unknown>;
    const projectKey = opts.projectKey ?? config.projectId ?? 'default';
    const spans = buildSpans(projectKey, data);

    const otlpPayload = {
      resourceSpans: [
        {
          resource: {
            attributes: [
              { key: 'service.name', value: { stringValue: 'vibebetter' } },
              { key: 'service.version', value: { stringValue: '1.68.0' } },
              { key: 'project.id', value: { stringValue: projectKey } },
            ],
          },
          scopeSpans: [
            {
              scope: { name: 'vibebetter-cli', version: '1.68.0' },
              spans,
            },
          ],
        },
      ],
    };

    if (opts.endpoint) {
      try {
        const response = await fetch(opts.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(otlpPayload),
        });
        info(`Sent ${spans.length} spans to ${pc.bold(opts.endpoint)} — ${response.status}`);
      } catch (err) {
        info(`Failed to send spans: ${err instanceof Error ? err.message : String(err)}`);
      }
      return;
    }

    console.log(JSON.stringify(otlpPayload, null, 2));
    console.log();
    info(`${spans.length} spans generated. Use --endpoint to send to an OTLP collector`);
  });
