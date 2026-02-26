export type ChangelogFormat = 'markdown' | 'html' | 'json' | 'rss';
export type ChangeType = 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';
export type VersionBump = 'major' | 'minor' | 'patch' | 'prerelease';

export interface SemanticVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease: string | null;
  buildMetadata: string | null;
  raw: string;
}

export interface ReleaseNote {
  id: string;
  version: SemanticVersion;
  title: string;
  date: Date;
  changes: ChangeEntry[];
  contributors: string[];
  breakingChanges: string[];
  migrationGuide: string | null;
  published: boolean;
  draft: boolean;
}

export interface ChangeEntry {
  type: ChangeType;
  description: string;
  issueIds: string[];
  prIds: string[];
  scope: string | null;
  author: string | null;
}

export interface ChangelogConfig {
  id: string;
  projectId: string;
  format: ChangelogFormat;
  includeTypes: ChangeType[];
  groupByType: boolean;
  showContributors: boolean;
  showIssueLinks: boolean;
  headerTemplate: string | null;
  footerTemplate: string | null;
  dateFormat: string;
  outputPath: string;
  autoGenerate: boolean;
  conventionalCommits: boolean;
}

export interface VersionPolicy {
  bumpStrategy: VersionBump;
  tagPrefix: string;
  prereleaseSuffix: string | null;
  allowPrereleasePublish: boolean;
}

export function parseVersion(raw: string): SemanticVersion {
  const cleaned = raw.replace(/^v/, '');
  const [mainPart = '', ...rest] = cleaned.split('+');
  const buildMetadata = rest.length > 0 ? rest.join('+') : null;
  const [versionStr = '', ...preParts] = mainPart.split('-');
  const prerelease = preParts.length > 0 ? preParts.join('-') : null;
  const [major = 0, minor = 0, patch = 0] = versionStr.split('.').map(Number);
  return { major, minor, patch, prerelease, buildMetadata, raw };
}

export function formatVersion(version: SemanticVersion): string {
  let str = `${version.major}.${version.minor}.${version.patch}`;
  if (version.prerelease) str += `-${version.prerelease}`;
  if (version.buildMetadata) str += `+${version.buildMetadata}`;
  return str;
}
