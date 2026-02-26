export type MigrationDirection = 'up' | 'down';
export type MigrationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
export type MigrationStepType = 'schema' | 'data' | 'index' | 'seed' | 'cleanup';

export interface MigrationStep {
  id: string;
  name: string;
  type: MigrationStepType;
  direction: MigrationDirection;
  sql?: string;
  script?: string;
  order: number;
  estimatedDurationMs: number;
  dependsOn: string[];
}

export interface DataMigration {
  id: string;
  version: string;
  name: string;
  description: string;
  steps: MigrationStep[];
  status: MigrationStatus;
  appliedAt?: Date;
  rolledBackAt?: Date;
  durationMs?: number;
  error?: string;
  checksum: string;
  createdBy: string;
}

export interface MigrationPlan {
  migrations: DataMigration[];
  totalSteps: number;
  estimatedDurationMs: number;
  requiresDowntime: boolean;
}

export interface MigrationResult {
  migrationId: string;
  status: MigrationStatus;
  stepsCompleted: number;
  stepsTotal: number;
  durationMs: number;
  error?: string;
}
