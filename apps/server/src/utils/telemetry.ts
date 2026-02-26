import { logger } from './logger.js';

export type TelemetryEventType =
  | 'command_run'
  | 'api_request'
  | 'analysis_complete'
  | 'error_occurred'
  | 'feature_used';

export interface TelemetryEvent {
  type: TelemetryEventType;
  name: string;
  properties: Record<string, unknown>;
  timestamp: Date;
  sessionId: string;
}

export interface TelemetryConfig {
  enabled: boolean;
  endpoint: string | null;
  batchSize: number;
  flushIntervalMs: number;
  anonymize: boolean;
}

const DEFAULT_CONFIG: TelemetryConfig = {
  enabled: true,
  endpoint: null,
  batchSize: 25,
  flushIntervalMs: 60_000,
  anonymize: true,
};

export class TelemetryCollector {
  private readonly config: TelemetryConfig;
  private buffer: TelemetryEvent[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly sessionId: string;

  constructor(config: Partial<TelemetryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();

    if (process.env.VIBEBETTER_TELEMETRY_OPT_OUT === '1' || process.env.DO_NOT_TRACK === '1') {
      this.config.enabled = false;
      logger.info('Telemetry disabled via opt-out environment variable');
    }

    if (this.config.enabled) {
      this.startFlushTimer();
      logger.info({ batchSize: this.config.batchSize, flushIntervalMs: this.config.flushIntervalMs }, 'Telemetry collector initialized');
    }
  }

  track(type: TelemetryEventType, name: string, properties: Record<string, unknown> = {}): void {
    if (!this.config.enabled) return;

    const event: TelemetryEvent = {
      type,
      name,
      properties: this.config.anonymize ? this.anonymizeProperties(properties) : properties,
      timestamp: new Date(),
      sessionId: this.sessionId,
    };

    this.buffer.push(event);
    logger.debug({ type, name }, 'Telemetry event tracked');

    if (this.buffer.length >= this.config.batchSize) {
      void this.flush();
    }
  }

  async flush(): Promise<number> {
    if (this.buffer.length === 0) return 0;

    const events = [...this.buffer];
    this.buffer = [];

    if (!this.config.endpoint) {
      logger.debug({ count: events.length }, 'Telemetry events buffered (no endpoint configured)');
      return events.length;
    }

    try {
      logger.info({ count: events.length, endpoint: this.config.endpoint }, 'Flushing telemetry events');
      return events.length;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error({ error: msg }, 'Failed to flush telemetry');
      this.buffer.unshift(...events);
      return 0;
    }
  }

  getBufferSize(): number {
    return this.buffer.length;
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  disable(): void {
    this.config.enabled = false;
    this.stopFlushTimer();
    this.buffer = [];
    logger.info('Telemetry disabled');
  }

  async shutdown(): Promise<void> {
    this.stopFlushTimer();
    await this.flush();
    logger.info('Telemetry collector shut down');
  }

  private anonymizeProperties(props: Record<string, unknown>): Record<string, unknown> {
    const sensitiveKeys = ['email', 'username', 'name', 'ip', 'token', 'password', 'secret'];
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
      if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
        result[key] = '[redacted]';
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  private startFlushTimer(): void {
    this.timer = setInterval(() => void this.flush(), this.config.flushIntervalMs);
  }

  private stopFlushTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private generateSessionId(): string {
    return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
}
