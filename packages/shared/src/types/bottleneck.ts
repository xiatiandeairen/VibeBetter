export type BottleneckType = 'resource' | 'process' | 'skill' | 'dependency' | 'review' | 'deployment';

export interface ProcessStep {
  id: string;
  name: string;
  order: number;
  avgDuration: number;
  p95Duration: number;
  throughput: number;
  utilization: number;
  waitTime: number;
  isBottleneck: boolean;
  bottleneckType?: BottleneckType;
}

export interface FlowMetrics {
  pipelineId: string;
  steps: ProcessStep[];
  totalCycleTime: number;
  totalLeadTime: number;
  efficiency: number;
  bottleneckCount: number;
  wastePercentage: number;
  recommendations: BottleneckRecommendation[];
}

export interface BottleneckRecommendation {
  stepId: string;
  type: BottleneckType;
  description: string;
  estimatedImpact: number;
  effort: 'low' | 'medium' | 'high';
  priority: number;
}

export interface FlowConfig {
  measurementPeriodDays: number;
  bottleneckThreshold: number;
  includeWeekends: boolean;
  excludeSteps: string[];
}
