export interface SyncStatus {
  sourceId: string;
  sourceName: string;
  status: 'synced' | 'syncing' | 'error' | 'pending' | 'stale';
  lastSyncAt: Date | null;
  nextSyncAt: Date | null;
  recordsSynced: number;
  errorMessage?: string;
  duration?: number;
}

export interface SyncConflict {
  id: string;
  sourceA: string;
  sourceB: string;
  field: string;
  valueA: unknown;
  valueB: unknown;
  detectedAt: Date;
  resolution?: SyncResolution;
}

export interface SyncResolution {
  strategy: 'source-a-wins' | 'source-b-wins' | 'merge' | 'manual';
  resolvedValue: unknown;
  resolvedAt: Date;
  resolvedBy?: string;
  notes?: string;
}

export interface SyncConfig {
  sourceId: string;
  enabled: boolean;
  intervalMinutes: number;
  retryAttempts: number;
  conflictStrategy: SyncResolution['strategy'];
  fieldMappings: FieldMapping[];
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: 'none' | 'lowercase' | 'uppercase' | 'trim' | 'custom';
  required: boolean;
}
