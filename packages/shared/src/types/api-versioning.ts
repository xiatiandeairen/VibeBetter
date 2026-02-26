export type ApiVersionStatus = 'current' | 'deprecated' | 'sunset' | 'beta' | 'alpha';
export type DeprecationSeverity = 'info' | 'warning' | 'critical';

export interface ApiVersion {
  version: string;
  status: ApiVersionStatus;
  releasedAt: Date;
  sunsetAt: Date | null;
  changelog: string;
  breaking: boolean;
  minClientVersion: string | null;
  endpoints: ApiEndpointVersion[];
}

export interface ApiEndpointVersion {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  addedIn: string;
  deprecatedIn: string | null;
  removedIn: string | null;
  replacedBy: string | null;
}

export interface DeprecationNotice {
  id: string;
  apiVersion: string;
  endpoint: string | null;
  severity: DeprecationSeverity;
  message: string;
  migrationGuide: string | null;
  announcedAt: Date;
  effectiveAt: Date;
  sunsetAt: Date | null;
  alternatives: DeprecationAlternative[];
}

export interface DeprecationAlternative {
  endpoint: string;
  method: string;
  description: string;
  migrationEffort: 'low' | 'medium' | 'high';
}

export interface VersionNegotiation {
  requested: string | null;
  resolved: string;
  warnings: string[];
  deprecated: boolean;
}

export interface ApiVersionPolicy {
  currentVersion: string;
  supportedVersions: string[];
  deprecatedVersions: string[];
  sunsetVersions: string[];
  defaultVersion: string;
  versionHeader: string;
  sunsetPeriodDays: number;
}
