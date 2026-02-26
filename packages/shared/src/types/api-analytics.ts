export type ApiVersion = 'v1' | 'v2';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type RateLimitStrategy = 'fixed_window' | 'sliding_window' | 'token_bucket';
export type QuotaPeriod = 'minute' | 'hour' | 'day' | 'month';

export interface ApiUsage {
  id: string;
  apiKeyId: string;
  projectId: string;
  endpoint: string;
  method: HttpMethod;
  version: ApiVersion;
  statusCode: number;
  responseTimeMs: number;
  requestSizeBytes: number;
  responseSizeBytes: number;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface ApiUsageAggregation {
  endpoint: string;
  method: HttpMethod;
  totalRequests: number;
  avgResponseTimeMs: number;
  p95ResponseTimeMs: number;
  errorRate: number;
  period: { from: Date; to: Date };
}

export interface RateLimitConfig {
  id: string;
  apiKeyId: string | null;
  projectId: string | null;
  strategy: RateLimitStrategy;
  maxRequests: number;
  windowMs: number;
  burstLimit: number | null;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuotaUsage {
  id: string;
  apiKeyId: string;
  projectId: string;
  period: QuotaPeriod;
  periodStart: Date;
  periodEnd: Date;
  requestCount: number;
  requestLimit: number;
  bandwidthBytes: number;
  bandwidthLimit: number;
  computeUnits: number;
  computeLimit: number;
  percentUsed: number;
  overageAllowed: boolean;
}

export interface QuotaAlert {
  apiKeyId: string;
  projectId: string;
  period: QuotaPeriod;
  metric: 'requests' | 'bandwidth' | 'compute';
  percentUsed: number;
  limit: number;
  current: number;
}
