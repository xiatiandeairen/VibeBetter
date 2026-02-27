export interface SkillGap {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
  category: 'ai-tools' | 'coding' | 'architecture' | 'testing' | 'devops' | 'soft-skills';
}

export interface MentorPair {
  id: string;
  mentorId: string;
  mentorName: string;
  menteeId: string;
  menteeName: string;
  matchScore: number;
  skillGaps: SkillGap[];
  topics: string[];
  frequency: 'weekly' | 'biweekly' | 'monthly';
  startDate: Date;
  endDate: Date | null;
  status: 'active' | 'paused' | 'completed';
  sessionsCompleted: number;
}

export interface LearningPath {
  id: string;
  menteeId: string;
  title: string;
  description: string;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    targetDate: Date;
    completed: boolean;
    completedAt: Date | null;
    resources: string[];
  }>;
  overallProgress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MentorshipConfig {
  maxMenteesPerMentor: number;
  minMatchScore: number;
  autoSuggest: boolean;
  focusSkills: string[];
  excludePairs: Array<[string, string]>;
}
