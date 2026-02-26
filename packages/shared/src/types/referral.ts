export type ReferralStatus = 'pending' | 'signed_up' | 'activated' | 'converted' | 'expired';
export type RewardType = 'credit' | 'discount' | 'free_month' | 'feature_unlock' | 'cash';
export type RewardStatus = 'pending' | 'granted' | 'redeemed' | 'expired' | 'revoked';

export interface ReferralProgram {
  id: string;
  name: string;
  description: string;
  active: boolean;
  rewardPerReferral: ReferralReward;
  rewardPerReferee: ReferralReward | null;
  maxReferralsPerUser: number;
  validUntil: Date | null;
  termsUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReferralReward {
  type: RewardType;
  amount: number;
  currency: string | null;
  description: string;
  status: RewardStatus;
  expiresInDays: number | null;
  grantedAt: Date | null;
  redeemedAt: Date | null;
}

export interface ReferralLink {
  id: string;
  userId: string;
  programId: string;
  code: string;
  url: string;
  clickCount: number;
  signupCount: number;
  conversionCount: number;
  createdAt: Date;
}

export interface ReferralEntry {
  id: string;
  referrerId: string;
  refereeEmail: string;
  refereeUserId: string | null;
  programId: string;
  status: ReferralStatus;
  referrerReward: ReferralReward | null;
  refereeReward: ReferralReward | null;
  invitedAt: Date;
  signedUpAt: Date | null;
  convertedAt: Date | null;
}
