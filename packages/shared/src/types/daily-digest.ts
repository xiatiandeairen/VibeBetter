export interface DigestSection {
  name: string;
  entries: DigestEntry[];
  priority: number;
}

export interface DigestEntry {
  title: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'flat';
  unit?: string;
}

export interface DailyDigest {
  id: string;
  projectId: string;
  date: string;
  sections: DigestSection[];
  generatedAt: Date;
  recipients: string[];
  format: 'email' | 'slack' | 'terminal';
}

export interface DigestConfig {
  enabled: boolean;
  schedule: string;
  sections: string[];
  recipients: string[];
  format: 'email' | 'slack' | 'terminal';
  timezone: string;
  includeCharts: boolean;
}
