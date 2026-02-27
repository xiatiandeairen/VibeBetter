export interface BurndownPoint {
  date: Date;
  remaining: number;
  resolved: number;
  added: number;
  net: number;
}

export interface BurndownChart {
  projectId: string;
  sprintId: string | null;
  startDate: Date;
  endDate: Date;
  initialDebt: number;
  currentDebt: number;
  targetDebt: number;
  points: BurndownPoint[];
  velocity: number;
  projectedCompletion: Date | null;
  onTrack: boolean;
}

export interface DebtTarget {
  id: string;
  projectId: string;
  targetScore: number;
  deadline: Date;
  createdAt: Date;
  createdBy: string;
  strategy: 'aggressive' | 'steady' | 'opportunistic';
  weeklyBudgetHours: number;
  categories: DebtCategory[];
}

export type DebtCategory =
  | 'code-complexity'
  | 'test-coverage'
  | 'dependency-updates'
  | 'documentation'
  | 'performance'
  | 'security'
  | 'architecture';

export interface BurndownConfig {
  sprintLengthDays: number;
  includeWeekends: boolean;
  debtScoringMethod: 'tdi' | 'custom' | 'story-points';
  alertThreshold: number;
}
