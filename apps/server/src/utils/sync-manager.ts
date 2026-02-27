import { logger } from './logger.js';

export interface SyncSource {
  id: string;
  name: string;
  type: 'github' | 'gitlab' | 'jira' | 'custom';
  lastSyncAt: Date | null;
}

export interface SyncRecord {
  sourceId: string;
  externalId: string;
  data: Record<string, unknown>;
  syncedAt: Date;
}

export interface SyncResult {
  sourceId: string;
  status: 'success' | 'partial' | 'error';
  recordsSynced: number;
  recordsFailed: number;
  conflicts: SyncConflictItem[];
  duration: number;
}

export interface SyncConflictItem {
  externalId: string;
  field: string;
  localValue: unknown;
  remoteValue: unknown;
}

export function syncFromSource(
  source: SyncSource,
  remoteRecords: Record<string, unknown>[],
  localRecords: Map<string, Record<string, unknown>>,
  conflictStrategy: 'remote-wins' | 'local-wins' | 'newest' = 'remote-wins',
): SyncResult {
  const startTime = Date.now();
  let synced = 0;
  let failed = 0;
  const conflicts: SyncConflictItem[] = [];

  for (const remote of remoteRecords) {
    const id = remote.id as string;
    if (!id) { failed++; continue; }

    const local = localRecords.get(id);
    if (local) {
      for (const [key, remoteVal] of Object.entries(remote)) {
        if (key === 'id') continue;
        const localVal = local[key];
        if (localVal !== undefined && localVal !== remoteVal) {
          conflicts.push({ externalId: id, field: key, localValue: localVal, remoteValue: remoteVal });
          if (conflictStrategy === 'remote-wins') {
            local[key] = remoteVal;
          }
        } else {
          local[key] = remoteVal;
        }
      }
      synced++;
    } else {
      localRecords.set(id, { ...remote });
      synced++;
    }
  }

  const duration = Date.now() - startTime;
  const status = failed > 0 ? (synced > 0 ? 'partial' : 'error') : 'success';

  logger.info({ sourceId: source.id, synced, failed, conflicts: conflicts.length, duration }, 'Sync completed');
  return { sourceId: source.id, status, recordsSynced: synced, recordsFailed: failed, conflicts, duration };
}
