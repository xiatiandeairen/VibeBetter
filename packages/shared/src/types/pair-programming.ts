export interface ExpertiseMap {
  developerId: string;
  developerName: string;
  files: Array<{
    path: string;
    commits: number;
    linesChanged: number;
    lastModified: Date;
    expertiseLevel: 'expert' | 'familiar' | 'novice';
  }>;
  primaryLanguages: string[];
  totalCommits: number;
}

export interface PairSuggestion {
  developer1: ExpertiseMap;
  developer2: ExpertiseMap;
  sharedFiles: number;
  complementaryFiles: number;
  complementaryScore: number;
  reason: string;
  suggestedFocus: string[];
  expectedBenefit: 'knowledge-transfer' | 'bus-factor-reduction' | 'skill-growth' | 'review-quality';
}

export interface PairHistory {
  developer1Id: string;
  developer2Id: string;
  sessions: number;
  lastPaired: Date;
  effectiveness: number;
}

export interface PairConfig {
  maxSuggestions: number;
  minComplementaryScore: number;
  excludePairs: Array<[string, string]>;
  focusAreas: string[];
  preferCrossFunctional: boolean;
}
