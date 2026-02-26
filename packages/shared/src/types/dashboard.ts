export interface DashboardWidget {
  id: string;
  type: 'metric-card' | 'line-chart' | 'area-chart' | 'radar-chart' | 'table' | 'text';
  title: string;
  dataSource: string;
  config: Record<string, unknown>;
  position: { row: number; col: number; colSpan: number };
}

export interface DashboardConfig {
  id: string;
  name: string;
  widgets: DashboardWidget[];
}

export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  id: 'default',
  name: 'AI Coding Overview',
  widgets: [
    { id: 'ai-success', type: 'metric-card', title: 'AI Success Rate', dataSource: 'overview.aiSuccessRate', config: { color: 'green', format: 'percent' }, position: { row: 0, col: 0, colSpan: 1 } },
    { id: 'ai-stable', type: 'metric-card', title: 'AI Stable Rate', dataSource: 'overview.aiStableRate', config: { color: 'blue', format: 'percent' }, position: { row: 0, col: 1, colSpan: 1 } },
    { id: 'psri', type: 'metric-card', title: 'PSRI Score', dataSource: 'overview.psriScore', config: { color: 'amber', format: 'decimal' }, position: { row: 0, col: 2, colSpan: 1 } },
    { id: 'files', type: 'metric-card', title: 'Total Files', dataSource: 'overview.totalFiles', config: { color: 'indigo', format: 'number' }, position: { row: 0, col: 3, colSpan: 1 } },
    { id: 'ai-trend', type: 'line-chart', title: 'AI Metrics Trend', dataSource: 'snapshots', config: { series: ['aiSuccessRate', 'aiStableRate'] }, position: { row: 2, col: 0, colSpan: 2 } },
    { id: 'psri-trend', type: 'line-chart', title: 'PSRI Trend', dataSource: 'snapshots', config: { series: ['psriScore'] }, position: { row: 2, col: 2, colSpan: 2 } },
  ],
};
