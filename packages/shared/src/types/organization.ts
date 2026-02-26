export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer';
export type MembershipStatus = 'active' | 'invited' | 'suspended' | 'deactivated';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  plan: 'free' | 'pro' | 'enterprise';
  maxProjects: number;
  maxMembers: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description?: string;
  projectIds: string[];
  createdAt: Date;
}

export interface Membership {
  id: string;
  userId: string;
  organizationId: string;
  teamId?: string;
  role: OrgRole;
  status: MembershipStatus;
  invitedBy?: string;
  joinedAt: Date;
  lastActiveAt?: Date;
}

export interface OrgInvite {
  id: string;
  organizationId: string;
  email: string;
  role: OrgRole;
  teamId?: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  acceptedAt?: Date;
}

export interface OrgStats {
  memberCount: number;
  teamCount: number;
  projectCount: number;
  totalPrs: number;
  avgPsri: number;
  avgTdi: number;
}
