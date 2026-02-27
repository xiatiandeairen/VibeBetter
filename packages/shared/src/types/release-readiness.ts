export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'none';

export interface ReleaseRisk {
  id: string;
  category: 'code-quality' | 'test-coverage' | 'dependency' | 'performance' | 'security' | 'process';
  level: RiskLevel;
  title: string;
  description: string;
  affectedFiles: string[];
  mitigations: string[];
  autoDetected: boolean;
}

export interface DeploymentWindow {
  id: string;
  startTime: Date;
  endTime: Date;
  type: 'standard' | 'emergency' | 'maintenance';
  approvedBy: string | null;
  restrictions: string[];
  timezone: string;
  recurring: boolean;
  cronExpression: string | null;
}

export interface RollbackPlan {
  id: string;
  releaseId: string;
  steps: Array<{
    order: number;
    action: string;
    command: string | null;
    estimatedMinutes: number;
    automated: boolean;
  }>;
  estimatedRollbackTime: number;
  dataLossRisk: RiskLevel;
  testedAt: Date | null;
  approvedBy: string | null;
}

export interface ReleaseReadiness {
  projectId: string;
  version: string;
  overallRisk: RiskLevel;
  score: number;
  risks: ReleaseRisk[];
  deploymentWindows: DeploymentWindow[];
  rollbackPlan: RollbackPlan | null;
  checklist: Array<{
    item: string;
    completed: boolean;
    required: boolean;
  }>;
  readyToDeploy: boolean;
  evaluatedAt: Date;
}
