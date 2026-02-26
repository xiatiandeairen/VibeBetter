export type TeamRoleName = 'owner' | 'admin' | 'member' | 'viewer' | 'billing';

export interface TeamRole {
  id: string;
  name: TeamRoleName;
  permissions: string[];
  description: string;
  isDefault: boolean;
  maxPerTeam: number | null;
  createdAt: Date;
}

export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked';

export interface TeamInvite {
  id: string;
  teamId: string;
  email: string;
  role: TeamRoleName;
  status: InviteStatus;
  invitedBy: string;
  message: string | null;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
  token: string;
}

export interface TeamMember {
  userId: string;
  teamId: string;
  role: TeamRole;
  joinedAt: Date;
  lastActiveAt: Date | null;
  isActive: boolean;
}

export interface TeamAnalytics {
  teamId: string;
  period: { start: Date; end: Date };
  memberCount: number;
  activeMemberCount: number;
  totalPRs: number;
  aiAssistedPRs: number;
  aiSuccessRate: number;
  averagePSRI: number;
  topContributors: Array<{ userId: string; prCount: number; aiUsageRate: number }>;
  riskTrend: 'improving' | 'stable' | 'degrading';
  generatedAt: Date;
}

export interface TeamSettings {
  teamId: string;
  name: string;
  slug: string;
  defaultRole: TeamRoleName;
  inviteApprovalRequired: boolean;
  maxMembers: number | null;
  allowedDomains: string[];
  autoJoinDomains: string[];
  notificationChannels: string[];
  createdAt: Date;
  updatedAt: Date;
}
