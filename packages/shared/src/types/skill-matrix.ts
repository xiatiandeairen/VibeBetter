export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface SkillLevel {
  skillId: string;
  developerId: string;
  level: 1 | 2 | 3 | 4 | 5;
  label: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  assessedAt: Date;
  evidence: string[];
  confidence: number;
}

export interface SkillGrowth {
  skillId: string;
  developerId: string;
  previousLevel: number;
  currentLevel: number;
  changeDate: Date;
  growthRate: number;
  projectedNextLevel: Date | null;
}

export interface TeamCapability {
  teamId: string;
  skills: {
    skill: Skill;
    avgLevel: number;
    coverage: number;
    gap: boolean;
    topDevelopers: string[];
  }[];
  overallCapabilityScore: number;
  criticalGaps: string[];
  strengths: string[];
  recommendations: string[];
}

export interface SkillMatrixConfig {
  skills: Skill[];
  assessmentMethod: 'git-analysis' | 'self-reported' | 'hybrid';
  refreshInterval: 'weekly' | 'monthly' | 'quarterly';
  minCommitsForAssessment: number;
}
