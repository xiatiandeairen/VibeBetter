import { logger } from './logger.js';

export type VersionStatus = 'current' | 'deprecated' | 'sunset';

export interface ApiVersion {
  version: string;
  status: VersionStatus;
  releasedAt: Date;
  deprecatedAt: Date | null;
  sunsetAt: Date | null;
  changesUrl: string | null;
}

export interface VersionNegotiationResult {
  requested: string | null;
  resolved: string;
  status: VersionStatus;
  warnings: string[];
}

const VERSIONS: ApiVersion[] = [
  { version: 'v1', status: 'deprecated', releasedAt: new Date('2025-06-01'), deprecatedAt: new Date('2026-01-01'), sunsetAt: new Date('2026-06-01'), changesUrl: '/docs/api/v1-to-v2' },
  { version: 'v2', status: 'current', releasedAt: new Date('2026-01-01'), deprecatedAt: null, sunsetAt: null, changesUrl: null },
];

export class ApiVersioning {
  private readonly versions: ApiVersion[];
  private readonly defaultVersion: string;

  constructor(versions: ApiVersion[] = VERSIONS, defaultVersion = 'v2') {
    this.versions = versions;
    this.defaultVersion = defaultVersion;
  }

  negotiate(requested: string | null): VersionNegotiationResult {
    const warnings: string[] = [];

    if (!requested) {
      const resolved = this.getVersion(this.defaultVersion)!;
      return { requested: null, resolved: resolved.version, status: resolved.status, warnings: ['No API version specified, using default'] };
    }

    const version = this.getVersion(requested);
    if (!version) {
      const current = this.getCurrent();
      warnings.push(`Unknown version "${requested}", falling back to ${current.version}`);
      logger.warn({ requested, fallback: current.version }, 'Unknown API version requested');
      return { requested, resolved: current.version, status: current.status, warnings };
    }

    if (version.status === 'sunset') {
      const current = this.getCurrent();
      warnings.push(`Version ${version.version} has been sunset, redirecting to ${current.version}`);
      if (version.changesUrl) warnings.push(`Migration guide: ${version.changesUrl}`);
      return { requested, resolved: current.version, status: current.status, warnings };
    }

    if (version.status === 'deprecated') {
      warnings.push(`Version ${version.version} is deprecated`);
      if (version.sunsetAt) warnings.push(`Sunset date: ${version.sunsetAt.toISOString().split('T')[0]}`);
      if (version.changesUrl) warnings.push(`Migration guide: ${version.changesUrl}`);
    }

    return { requested, resolved: version.version, status: version.status, warnings };
  }

  getVersionHeaders(result: VersionNegotiationResult): Record<string, string> {
    const headers: Record<string, string> = {
      'X-API-Version': result.resolved,
    };

    if (result.status === 'deprecated') {
      headers['Deprecation'] = 'true';
      const version = this.getVersion(result.resolved);
      if (version?.sunsetAt) {
        headers['Sunset'] = version.sunsetAt.toUTCString();
      }
    }

    if (result.warnings.length > 0) {
      headers['X-API-Warnings'] = result.warnings.join('; ');
    }

    return headers;
  }

  listVersions(): ApiVersion[] {
    return [...this.versions];
  }

  getCurrent(): ApiVersion {
    return this.versions.find((v) => v.status === 'current') ?? this.versions[this.versions.length - 1]!;
  }

  private getVersion(version: string): ApiVersion | undefined {
    return this.versions.find((v) => v.version === version);
  }
}
