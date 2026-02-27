export interface FileFreshness {
  path: string;
  lastModifiedAt: Date;
  daysSinceTouch: number;
  lastAuthor: string;
  lines: number;
  freshness: 'fresh' | 'aging' | 'stale' | 'ancient';
}

export interface FreshnessReport {
  id: string;
  projectId: string;
  generatedAt: Date;
  files: FileFreshness[];
  totalFiles: number;
  freshCount: number;
  staleCount: number;
  ancientCount: number;
  avgAge: number;
}

export interface FreshnessConfig {
  freshDays: number;
  agingDays: number;
  staleDays: number;
  excludePatterns: string[];
  includeExtensions: string[];
}
