import { randomUUID } from 'node:crypto';
import { logger } from './logger.js';

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId: string | null;
  service: string;
  operation: string;
  startTime: number;
  attributes: Record<string, string | number | boolean>;
}

export interface SpanRecord {
  traceId: string;
  spanId: string;
  parentSpanId: string | null;
  service: string;
  operation: string;
  startTime: number;
  endTime: number;
  durationMs: number;
  status: 'ok' | 'error';
  attributes: Record<string, string | number | boolean>;
  error: string | null;
}

export interface TracingConfig {
  serviceName: string;
  enabled: boolean;
  sampleRate: number;
  maxSpans: number;
  propagationFormat: 'w3c' | 'b3' | 'jaeger';
}

const DEFAULT_CONFIG: TracingConfig = {
  serviceName: 'vibebetter-server',
  enabled: true,
  sampleRate: 1.0,
  maxSpans: 10_000,
  propagationFormat: 'w3c',
};

function generateSpanId(): string {
  return randomUUID().replace(/-/g, '').slice(0, 16);
}

export class RequestTracer {
  private readonly config: TracingConfig;
  private readonly spans: SpanRecord[] = [];

  constructor(config: Partial<TracingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  startTrace(operation: string, parentTraceId?: string, parentSpanId?: string): TraceContext {
    const traceId = parentTraceId ?? randomUUID().replace(/-/g, '');
    const spanId = generateSpanId();

    return {
      traceId,
      spanId,
      parentSpanId: parentSpanId ?? null,
      service: this.config.serviceName,
      operation,
      startTime: Date.now(),
      attributes: {},
    };
  }

  endSpan(ctx: TraceContext, status: 'ok' | 'error' = 'ok', error?: string): SpanRecord {
    const endTime = Date.now();
    const record: SpanRecord = {
      traceId: ctx.traceId,
      spanId: ctx.spanId,
      parentSpanId: ctx.parentSpanId,
      service: ctx.service,
      operation: ctx.operation,
      startTime: ctx.startTime,
      endTime,
      durationMs: endTime - ctx.startTime,
      status,
      attributes: { ...ctx.attributes },
      error: error ?? null,
    };

    if (this.config.enabled && Math.random() <= this.config.sampleRate) {
      this.spans.push(record);
      if (this.spans.length > this.config.maxSpans) {
        this.spans.shift();
      }
    }

    logger.debug({ traceId: record.traceId, spanId: record.spanId, durationMs: record.durationMs, status }, 'Span completed');
    return record;
  }

  createChildSpan(parent: TraceContext, operation: string): TraceContext {
    return this.startTrace(operation, parent.traceId, parent.spanId);
  }

  injectHeaders(ctx: TraceContext): Record<string, string> {
    if (this.config.propagationFormat === 'w3c') {
      return {
        traceparent: `00-${ctx.traceId}-${ctx.spanId}-01`,
        tracestate: `vibe=${ctx.service}`,
      };
    }
    if (this.config.propagationFormat === 'b3') {
      return {
        'X-B3-TraceId': ctx.traceId,
        'X-B3-SpanId': ctx.spanId,
        'X-B3-ParentSpanId': ctx.parentSpanId ?? '',
        'X-B3-Sampled': '1',
      };
    }
    return {
      'uber-trace-id': `${ctx.traceId}:${ctx.spanId}:${ctx.parentSpanId ?? '0'}:1`,
    };
  }

  extractTraceId(headers: Record<string, string | undefined>): { traceId: string; spanId: string } | null {
    const traceparent = headers['traceparent'];
    if (traceparent) {
      const parts = traceparent.split('-');
      const tid = parts[1];
      const sid = parts[2];
      if (parts.length >= 3 && tid && sid) {
        return { traceId: tid, spanId: sid };
      }
    }
    const b3TraceId = headers['x-b3-traceid'];
    if (b3TraceId) {
      return { traceId: b3TraceId, spanId: headers['x-b3-spanid'] || generateSpanId() };
    }
    return null;
  }

  getSpans(): SpanRecord[] {
    return [...this.spans];
  }

  clear(): void {
    this.spans.length = 0;
  }
}
