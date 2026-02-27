export interface DayCommitFrequency {
  day: string;
  commits: number;
  authors: number;
  additions: number;
  deletions: number;
  peakHour: number;
}

export interface HourlyDistribution {
  hour: number;
  commits: number;
  avgSize: number;
}

export interface CommitFrequencyReport {
  id: string;
  projectId: string;
  periodStart: Date;
  periodEnd: Date;
  daily: DayCommitFrequency[];
  hourly: HourlyDistribution[];
  totalCommits: number;
  busiestDay: string;
  quietestDay: string;
  avgPerDay: number;
}

export interface CommitFrequencyConfig {
  periodDays: number;
  excludeWeekends: boolean;
  excludeBots: boolean;
  minCommitsForAnalysis: number;
}
