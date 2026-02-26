export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'disputed';
export type BillingCycle = 'monthly' | 'quarterly' | 'annually';

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
  periodStart: Date;
  periodEnd: Date;
  metadata?: Record<string, unknown>;
}

export interface DetailedInvoice {
  id: string;
  number: string;
  organizationId: string;
  billingCycle: BillingCycle;
  lines: InvoiceLine[];
  subtotal: number;
  taxTotal: number;
  total: number;
  currency: string;
  paymentStatus: PaymentStatus;
  issuedAt: Date;
  dueAt: Date;
  paidAt?: Date;
  refundedAt?: Date;
  pdfUrl?: string;
  notes?: string;
}

export interface PaymentAttempt {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  errorMessage?: string;
  attemptedAt: Date;
  succeededAt?: Date;
}
