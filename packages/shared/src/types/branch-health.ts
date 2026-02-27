export interface BranchHealthInfo {
  name: string;
  ageDays: number;
  behindMain: number;
  aheadOfMain: number;
  hasConflicts: boolean;
  lastCommitAt: Date;
  author: string;
  status: 'healthy' | 'stale' | 'conflict' | 'abandoned';
}

export interface BranchHealthReport {
  id: string;
  projectId: string;
  generatedAt: Date;
  branches: BranchHealthInfo[];
  totalBranches: number;
  healthyCount: number;
  staleCount: number;
  abandonedCount: number;
  conflictCount: number;
}

export interface BranchHealthConfig {
  staleDays: number;
  abandonedDays: number;
  excludePatterns: string[];
  protectedBranches: string[];
  autoDeleteStale: boolean;
}
