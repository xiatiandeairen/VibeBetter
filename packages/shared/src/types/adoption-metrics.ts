export interface AdoptionRate {
  toolId: string;
  toolName: string;
  activeUsers: number;
  totalUsers: number;
  adoptionPercent: number;
  firstUsed: Date;
  lastUsed: Date;
  category: 'ai-coding' | 'ai-review' | 'ai-testing' | 'ai-docs' | 'ai-other';
}

export interface AdoptionTrend {
  toolId: string;
  dataPoints: Array<{
    date: Date;
    activeUsers: number;
    adoptionPercent: number;
    sessionsCount: number;
  }>;
  trendDirection: 'growing' | 'stable' | 'declining';
  growthRate: number;
  projectedAdoption: number;
}

export interface ToolMigration {
  id: string;
  fromTool: string;
  toTool: string;
  startDate: Date;
  targetDate: Date;
  currentPercent: number;
  affectedUsers: number;
  migratedUsers: number;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  blockers: string[];
}

export interface AdoptionConfig {
  trackingEnabled: boolean;
  tools: Array<{
    id: string;
    name: string;
    category: AdoptionRate['category'];
    detectionPattern: string;
  }>;
  reportingFrequency: 'daily' | 'weekly' | 'monthly';
  minimumSessionDuration: number;
}
