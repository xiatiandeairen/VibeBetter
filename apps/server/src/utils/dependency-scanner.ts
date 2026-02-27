import { logger } from './logger.js';

export interface DependencyInfo {
  name: string;
  currentVersion: string;
  latestVersion: string | null;
  isOutdated: boolean;
  majorsBehind: number;
  isDev: boolean;
  hasKnownVulnerability: boolean;
  vulnerabilitySeverity: 'critical' | 'high' | 'medium' | 'low' | null;
}

export interface ScanResult {
  scannedAt: Date;
  totalDependencies: number;
  outdated: number;
  vulnerable: number;
  upToDate: number;
  dependencies: DependencyInfo[];
}

export function scanDependencies(
  packageJson: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> },
  knownVulnerabilities?: Map<string, 'critical' | 'high' | 'medium' | 'low'>,
): ScanResult {
  const deps: DependencyInfo[] = [];
  const vulnMap = knownVulnerabilities ?? new Map();

  const processEntries = (entries: Record<string, string>, isDev: boolean) => {
    for (const [name, version] of Object.entries(entries)) {
      const cleanVersion = version.replace(/^[\^~>=<]*/g, '');
      const vulnSeverity = vulnMap.get(name) ?? null;

      deps.push({
        name,
        currentVersion: cleanVersion,
        latestVersion: null,
        isOutdated: false,
        majorsBehind: 0,
        isDev,
        hasKnownVulnerability: vulnSeverity !== null,
        vulnerabilitySeverity: vulnSeverity,
      });
    }
  };

  if (packageJson.dependencies) processEntries(packageJson.dependencies, false);
  if (packageJson.devDependencies) processEntries(packageJson.devDependencies, true);

  const result: ScanResult = {
    scannedAt: new Date(),
    totalDependencies: deps.length,
    outdated: deps.filter(d => d.isOutdated).length,
    vulnerable: deps.filter(d => d.hasKnownVulnerability).length,
    upToDate: deps.filter(d => !d.isOutdated).length,
    dependencies: deps,
  };

  logger.info({ total: result.totalDependencies, vulnerable: result.vulnerable }, 'Dependency scan complete');
  return result;
}
