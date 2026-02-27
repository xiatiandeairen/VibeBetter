export interface AIEditorSession {
  id: string;
  editor: string;
  plugin: string;
  startedAt: Date;
  endedAt: Date | null;
  completions: number;
  acceptedCompletions: number;
  avgLatencyMs: number;
}

export interface AIEditorStats {
  editor: string;
  sessions: number;
  totalCompletions: number;
  acceptRate: number;
  avgLatencyMs: number;
  activeUsers: number;
}

export interface AIEditorComparison {
  editors: AIEditorStats[];
  bestAcceptRate: string;
  bestLatency: string;
  recommendation: string;
}

export interface AIEditorConfig {
  trackEditors: string[];
  sessionTimeoutMinutes: number;
  minCompletionsForStats: number;
}
