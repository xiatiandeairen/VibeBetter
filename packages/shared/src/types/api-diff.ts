export interface ApiEndpointDiff {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  change: 'added' | 'removed' | 'modified' | 'deprecated';
  breaking: boolean;
  detail: string;
  version: string;
}

export interface ApiDiffReport {
  id: string;
  projectId: string;
  generatedAt: Date;
  baseVersion: string;
  targetVersion: string;
  diffs: ApiEndpointDiff[];
  totalChanges: number;
  breakingCount: number;
}

export interface ApiDiffConfig {
  baseVersion: string;
  targetVersion: string;
  includeDeprecated: boolean;
  breakingOnly: boolean;
  excludePaths: string[];
}
