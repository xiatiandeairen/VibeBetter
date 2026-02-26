export type WebhookHttpMethod = 'POST' | 'PUT' | 'PATCH';
export type WebhookStatus = 'active' | 'inactive' | 'failing';
export type WebhookEventType =
  | 'analysis.completed'
  | 'risk.threshold_exceeded'
  | 'decision.created'
  | 'decision.resolved'
  | 'snapshot.created'
  | 'report.generated'
  | 'alert.triggered'
  | 'project.updated';

export type DeliveryStatus = 'pending' | 'success' | 'failed' | 'retrying';

export interface WebhookEndpoint {
  id: string;
  projectId: string;
  url: string;
  method: WebhookHttpMethod;
  secret: string;
  status: WebhookStatus;
  events: WebhookEventType[];
  headers: Record<string, string>;
  retryCount: number;
  maxRetries: number;
  timeoutMs: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookEvent {
  id: string;
  endpointId: string;
  type: WebhookEventType;
  payload: Record<string, unknown>;
  idempotencyKey: string;
  createdAt: Date;
}

export interface WebhookDelivery {
  id: string;
  eventId: string;
  endpointId: string;
  status: DeliveryStatus;
  httpStatus: number | null;
  requestHeaders: Record<string, string>;
  requestBody: string;
  responseBody: string | null;
  responseTimeMs: number | null;
  attempt: number;
  nextRetryAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
}

export interface WebhookDeliveryFilter {
  endpointId?: string;
  eventId?: string;
  status?: DeliveryStatus;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

export interface WebhookDeliveryPage {
  items: WebhookDelivery[];
  total: number;
  hasMore: boolean;
}
