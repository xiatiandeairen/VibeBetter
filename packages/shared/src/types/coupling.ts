export interface CouplingPair {
  fileA: string;
  fileB: string;
  coChangeCount: number;
  strength: number;
  type: 'logical' | 'structural' | 'temporal';
  firstSeen: Date;
  lastSeen: Date;
}

export interface CouplingReport {
  id: string;
  projectId: string;
  generatedAt: Date;
  pairs: CouplingPair[];
  totalPairs: number;
  highCouplingCount: number;
  avgStrength: number;
  clusters: CouplingCluster[];
}

export interface CouplingCluster {
  id: string;
  files: string[];
  avgStrength: number;
  suggestion: string;
}

export interface CouplingConfig {
  minCoChanges: number;
  minStrength: number;
  lookbackDays: number;
  excludePatterns: string[];
  clusterThreshold: number;
}
