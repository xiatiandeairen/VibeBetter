export interface CodeOwner {
  id: string;
  name: string;
  email: string;
  teamId: string | null;
  ownedPaths: string[];
  totalCommits: number;
  recentCommits: number;
  confidence: number;
}

export interface OwnershipRule {
  pattern: string;
  owners: string[];
  minApprovals: number;
  isRequired: boolean;
  source: 'git-history' | 'manual' | 'codeowners-file';
  confidence: number;
  lastUpdated: Date;
}

export interface OwnershipMap {
  projectId: string;
  generatedAt: Date;
  rules: OwnershipRule[];
  unmappedPaths: string[];
  coverage: number;
  totalFiles: number;
  mappedFiles: number;
}

export interface OwnershipConflict {
  path: string;
  claimants: Array<{
    ownerId: string;
    commits: number;
    lastCommit: Date;
    confidence: number;
  }>;
  resolution: 'highest-confidence' | 'most-recent' | 'manual' | null;
}

export interface OwnershipConfig {
  minCommits: number;
  minConfidence: number;
  lookbackDays: number;
  excludePatterns: string[];
  teamMapping: Record<string, string[]>;
}
