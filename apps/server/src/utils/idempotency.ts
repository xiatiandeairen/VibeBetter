import { logger } from './logger.js';

export type IdempotencyStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface IdempotencyRecord {
  key: string;
  status: IdempotencyStatus;
  statusCode: number | null;
  responseBody: string | null;
  responseHeaders: Record<string, string>;
  createdAt: Date;
  completedAt: Date | null;
  expiresAt: Date;
}

export interface IdempotencyOptions {
  ttlMs: number;
  headerName: string;
  allowedMethods: string[];
}

const DEFAULT_OPTIONS: IdempotencyOptions = {
  ttlMs: 24 * 60 * 60 * 1000,
  headerName: 'Idempotency-Key',
  allowedMethods: ['POST', 'PUT', 'PATCH'],
};

export class IdempotencyStore {
  private store = new Map<string, IdempotencyRecord>();
  private options: IdempotencyOptions;

  constructor(options: Partial<IdempotencyOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  get headerName(): string {
    return this.options.headerName;
  }

  get allowedMethods(): string[] {
    return this.options.allowedMethods;
  }

  async check(key: string): Promise<IdempotencyRecord | null> {
    this.cleanup();
    const record = this.store.get(key) ?? null;
    if (record) {
      logger.info({ key, status: record.status }, 'Idempotency cache hit');
    }
    return record;
  }

  async start(key: string): Promise<IdempotencyRecord> {
    const record: IdempotencyRecord = {
      key,
      status: 'processing',
      statusCode: null,
      responseBody: null,
      responseHeaders: {},
      createdAt: new Date(),
      completedAt: null,
      expiresAt: new Date(Date.now() + this.options.ttlMs),
    };
    this.store.set(key, record);
    logger.info({ key }, 'Idempotency request started');
    return record;
  }

  async complete(key: string, statusCode: number, body: string, headers: Record<string, string> = {}): Promise<void> {
    const record = this.store.get(key);
    if (!record) return;

    record.status = 'completed';
    record.statusCode = statusCode;
    record.responseBody = body;
    record.responseHeaders = headers;
    record.completedAt = new Date();
    logger.info({ key, statusCode }, 'Idempotency request completed');
  }

  async fail(key: string): Promise<void> {
    const record = this.store.get(key);
    if (!record) return;
    record.status = 'failed';
    record.completedAt = new Date();
    this.store.delete(key);
    logger.warn({ key }, 'Idempotency request failed, key released');
  }

  private cleanup(): void {
    const now = new Date();
    for (const [key, record] of this.store) {
      if (record.expiresAt < now) {
        this.store.delete(key);
      }
    }
  }

  size(): number {
    this.cleanup();
    return this.store.size;
  }
}
