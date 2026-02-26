export interface InsightTemplate {
  id: string;
  name: string;
  description: string;
  collectors: string[];
  metrics: MetricDefinition[];
  dashboard: string;
}

export interface MetricDefinition {
  id: string;
  name: string;
  formula: string;
  source: string;
  aggregation: 'avg' | 'sum' | 'count' | 'ratio' | 'custom';
}

export const AI_CODING_TEMPLATE: InsightTemplate = {
  id: 'ai-coding',
  name: 'AI Coding Insight',
  description: 'Measure AI coding effectiveness, track structural risk, and make data-driven decisions',
  collectors: ['GITHUB', 'LOCAL_GIT'],
  metrics: [
    { id: 'ai-success-rate', name: 'AI Success Rate', formula: 'AI PRs merged without major revision / Total AI PRs', source: 'pull_requests', aggregation: 'ratio' },
    { id: 'ai-stable-rate', name: 'AI Stable Rate', formula: 'AI PRs without rollback / Total AI PRs', source: 'pull_requests', aggregation: 'ratio' },
    { id: 'psri', name: 'PSRI', formula: 'Weighted sum of 6 risk dimensions', source: 'file_metrics', aggregation: 'custom' },
    { id: 'tdi', name: 'TDI', formula: '(High complexity ratio + duplication + low coverage) × change frequency', source: 'file_metrics', aggregation: 'custom' },
  ],
  dashboard: 'default',
};

export const CODE_REVIEW_TEMPLATE: InsightTemplate = {
  id: 'code-review',
  name: 'Code Review Insight',
  description: 'Track review efficiency, knowledge distribution, and collaboration patterns',
  collectors: ['GITHUB'],
  metrics: [
    { id: 'review-time', name: 'Avg Review Time', formula: 'Time from PR open to first review', source: 'pull_requests', aggregation: 'avg' },
    { id: 'review-rounds', name: 'Avg Review Rounds', formula: 'Average review iterations per PR', source: 'pull_requests', aggregation: 'avg' },
    { id: 'review-coverage', name: 'Review Coverage', formula: 'PRs with reviews / Total PRs', source: 'pull_requests', aggregation: 'ratio' },
  ],
  dashboard: 'code-review',
};

export const AVAILABLE_TEMPLATES: InsightTemplate[] = [AI_CODING_TEMPLATE, CODE_REVIEW_TEMPLATE];
