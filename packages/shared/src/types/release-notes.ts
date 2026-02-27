export interface ReleaseNoteEntry {
  type: 'feature' | 'fix' | 'breaking' | 'chore' | 'perf' | 'docs';
  scope: string;
  message: string;
  prNumber: number | null;
  author: string;
  commitHash: string;
}

export interface ReleaseNotesDocument {
  id: string;
  version: string;
  projectId: string;
  generatedAt: Date;
  entries: ReleaseNoteEntry[];
  markdown: string;
  breakingChanges: number;
  contributors: string[];
}

export interface ReleaseNotesConfig {
  groupByType: boolean;
  includeContributors: boolean;
  includeCommitHash: boolean;
  conventionalCommits: boolean;
  excludeScopes: string[];
  template: 'default' | 'detailed' | 'minimal';
}
