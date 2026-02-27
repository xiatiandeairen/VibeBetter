import { logger } from './logger.js';

export interface DependencyInfo {
  name: string;
  currentVersion: string;
  latestVersion: string;
  type: 'dependencies' | 'devDependencies';
}

export interface UpgradeResult {
  name: string;
  currentVersion: string;
  latestVersion: string;
  severity: 'major' | 'minor' | 'patch';
  breaking: boolean;
  migrationRequired: boolean;
}

function parseSemver(v: string): [number, number, number] {
  const parts = v.replace(/^[^0-9]*/, '').split('.').map(Number);
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

export function checkUpgrades(deps: DependencyInfo[]): UpgradeResult[] {
  if (deps.length === 0) {
    logger.warn('No dependencies provided for upgrade check');
    return [];
  }

  const results: UpgradeResult[] = [];

  for (const dep of deps) {
    const [curMajor, curMinor] = parseSemver(dep.currentVersion);
    const [latMajor, latMinor] = parseSemver(dep.latestVersion);

    if (dep.currentVersion === dep.latestVersion) continue;

    let severity: UpgradeResult['severity'];
    if (latMajor > curMajor) severity = 'major';
    else if (latMinor > curMinor) severity = 'minor';
    else severity = 'patch';

    const breaking = severity === 'major';

    results.push({
      name: dep.name,
      currentVersion: dep.currentVersion,
      latestVersion: dep.latestVersion,
      severity,
      breaking,
      migrationRequired: breaking,
    });
  }

  results.sort((a, b) => {
    const sevOrder = { major: 0, minor: 1, patch: 2 };
    return sevOrder[a.severity] - sevOrder[b.severity];
  });

  logger.info({ total: deps.length, upgrades: results.length, breaking: results.filter(r => r.breaking).length }, 'Upgrade check complete');
  return results;
}
