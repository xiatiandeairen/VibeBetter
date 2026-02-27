export interface UpgradeStep {
  dependency: string;
  currentVersion: string;
  latestVersion: string;
  breaking: boolean;
  migrationSteps: string[];
  releaseUrl: string;
  severity: 'major' | 'minor' | 'patch';
}

export interface UpgradeReport {
  id: string;
  projectId: string;
  generatedAt: Date;
  steps: UpgradeStep[];
  totalDependencies: number;
  breakingCount: number;
  patchCount: number;
}

export interface UpgradeConfig {
  includeDevDependencies: boolean;
  allowMajor: boolean;
  allowPrerelease: boolean;
  excludePackages: string[];
  autoMerge: boolean;
}
