export type OnboardingStepStatus = 'pending' | 'active' | 'completed' | 'skipped';
export type OnboardingCategory = 'setup' | 'integration' | 'tutorial' | 'verification';
export type TemplateTarget = 'individual' | 'team' | 'enterprise';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  category: OnboardingCategory;
  status: OnboardingStepStatus;
  order: number;
  required: boolean;
  estimatedMinutes: number;
  actionUrl: string | null;
  actionLabel: string | null;
  completedAt: Date | null;
  skippedAt: Date | null;
  metadata: Record<string, unknown>;
}

export interface OnboardingProgress {
  id: string;
  userId: string;
  organizationId: string | null;
  templateId: string;
  steps: OnboardingStep[];
  completedSteps: number;
  totalSteps: number;
  percentComplete: number;
  startedAt: Date;
  completedAt: Date | null;
  lastActivityAt: Date;
  currentStepId: string | null;
  dismissed: boolean;
}

export interface OnboardingTemplate {
  id: string;
  name: string;
  description: string;
  target: TemplateTarget;
  steps: Omit<OnboardingStep, 'status' | 'completedAt' | 'skippedAt'>[];
  version: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingConfig {
  autoStart: boolean;
  allowSkip: boolean;
  showProgressBar: boolean;
  reminderIntervalHours: number;
  maxDismissals: number;
}
