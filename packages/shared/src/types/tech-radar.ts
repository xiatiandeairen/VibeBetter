export type RadarRing = 'adopt' | 'trial' | 'assess' | 'hold';
export type RadarQuadrant = 'languages' | 'frameworks' | 'tools' | 'platforms';

export interface TechRadarItem {
  id: string;
  name: string;
  ring: RadarRing;
  quadrant: RadarQuadrant;
  isNew: boolean;
  description: string;
  version: string | null;
  usedInFiles: number;
  firstSeen: Date;
  lastSeen: Date;
  movedFrom: RadarRing | null;
  movedAt: Date | null;
}

export interface TechRadarSnapshot {
  projectId: string;
  generatedAt: Date;
  items: TechRadarItem[];
  summary: {
    adopt: number;
    trial: number;
    assess: number;
    hold: number;
    totalNew: number;
  };
}

export interface TechRadarConfig {
  autoDetect: boolean;
  overrides: Array<{
    name: string;
    ring: RadarRing;
    quadrant: RadarQuadrant;
  }>;
  excludePatterns: string[];
  includeDevDependencies: boolean;
}
