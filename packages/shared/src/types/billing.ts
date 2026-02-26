export type PaymentMethodType = 'card' | 'bank_transfer' | 'paypal';
export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
export type BillingEventType =
  | 'invoice.created'
  | 'invoice.paid'
  | 'invoice.failed'
  | 'payment_method.attached'
  | 'payment_method.detached'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.canceled';

export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentMethodType;
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: Date;
}

export interface BillingInvoice {
  id: string;
  subscriptionId: string;
  userId: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  issuedAt: Date;
  dueAt: Date;
  paidAt?: Date;
  pdfUrl?: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface BillingEvent {
  id: string;
  type: BillingEventType;
  userId: string;
  resourceId: string;
  payload: Record<string, unknown>;
  occurredAt: Date;
  processedAt?: Date;
}
