export interface WasteItem {
  id: string;
  category: string;
  description: string;
  hoursWasted: number;
  recurrence: 'daily' | 'weekly' | 'monthly' | 'once';
  automatable: boolean;
  suggestion: string;
}

export interface WasteReport {
  id: string;
  projectId: string;
  generatedAt: Date;
  items: WasteItem[];
  totalWeeklyHours: number;
  topCategory: string;
  potentialSavings: number;
}

export interface WasteDetectionConfig {
  categories: string[];
  minHoursThreshold: number;
  lookbackDays: number;
  includeAutomatable: boolean;
  excludeCategories: string[];
}
