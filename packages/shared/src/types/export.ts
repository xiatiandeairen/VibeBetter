export type ExportFormat = 'json' | 'csv' | 'xlsx' | 'pdf' | 'html' | 'markdown';
export type ExportStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'expired';
export type ExportScope = 'project' | 'organization' | 'team' | 'user';

export interface ExportConfig {
  id: string;
  projectId: string;
  name: string;
  format: ExportFormat;
  scope: ExportScope;
  includeMetrics: boolean;
  includeHotspots: boolean;
  includeDecisions: boolean;
  includeHistory: boolean;
  dateRange: { from: Date; to: Date } | null;
  filters: Record<string, unknown>;
  schedule: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExportJob {
  id: string;
  configId: string;
  projectId: string;
  status: ExportStatus;
  format: ExportFormat;
  fileUrl: string | null;
  fileSizeBytes: number | null;
  rowCount: number | null;
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface ExportJobFilter {
  configId?: string;
  projectId?: string;
  status?: ExportStatus;
  format?: ExportFormat;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

export interface ExportJobPage {
  items: ExportJob[];
  total: number;
  hasMore: boolean;
}
