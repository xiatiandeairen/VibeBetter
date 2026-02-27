export interface CapacityModel {
  teamId: string;
  period: { from: Date; to: Date };
  teamSize: number;
  availableHours: number;
  committedHours: number;
  utilizationRate: number;
  bufferPercentage: number;
  slots: CapacitySlot[];
}

export interface CapacitySlot {
  sprintId: string;
  sprintName: string;
  totalCapacity: number;
  allocated: number;
  remaining: number;
  overCommitted: boolean;
  allocations: ResourceAllocation[];
}

export interface ResourceAllocation {
  developerId: string;
  developerName: string;
  availableHours: number;
  allocatedHours: number;
  projects: { projectId: string; hours: number }[];
  utilizationPct: number;
  onLeave: boolean;
}

export interface Bottleneck {
  type: 'resource' | 'skill' | 'dependency' | 'review';
  description: string;
  severity: 'blocking' | 'significant' | 'minor';
  affectedSprints: string[];
  suggestedResolution: string;
  estimatedImpactDays: number;
}

export interface CapacityPlanConfig {
  hoursPerDay: number;
  daysPerSprint: number;
  defaultBufferPct: number;
  includeOnLeave: boolean;
  velocityBasedPlanning: boolean;
  rollingWindowSprints: number;
}
