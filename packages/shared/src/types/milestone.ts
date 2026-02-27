export type MilestoneStatus = 'planned' | 'in-progress' | 'on-track' | 'at-risk' | 'behind' | 'completed' | 'cancelled';

export interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  startDate: Date;
  status: MilestoneStatus;
  progress: number;
  owner: string;
  deliverables: Deliverable[];
  dependencies: string[];
  tags: string[];
}

export interface Deliverable {
  id: string;
  milestoneId: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  assignee?: string;
  completedAt?: Date;
  linkedPRs: string[];
  weight: number;
}

export interface MilestoneReport {
  milestoneId: string;
  generatedAt: Date;
  progressSummary: {
    totalDeliverables: number;
    completedDeliverables: number;
    blockedDeliverables: number;
    progressPercent: number;
  };
  riskAssessment: {
    daysRemaining: number;
    projectedCompletion: Date;
    isOnTrack: boolean;
    risks: string[];
  };
}

export interface MilestoneConfig {
  autoTrackPRs: boolean;
  notifyOnStatusChange: boolean;
  riskThresholdDays: number;
  includeInDigest: boolean;
}
