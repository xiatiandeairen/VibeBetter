'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { MetricCard } from '@/components/ui/metric-card';
import { LineChart } from '@/components/charts/line-chart';
import { toPercent } from '@vibebetter/shared';

export default function DashboardOverviewPage() {
  const [projectId, setProjectId] = useState('');

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  });

  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['metrics-overview', projectId],
    queryFn: () => api.getMetricsOverview(projectId),
    enabled: !!projectId,
  });

  const { data: snapshotsData, isLoading: snapshotsLoading } = useQuery({
    queryKey: ['metric-snapshots', projectId],
    queryFn: () => api.getMetricSnapshots(projectId),
    enabled: !!projectId,
  });

  const projects = projectsData?.data ?? [];
  const overview = overviewData?.data;
  const snapshots = snapshotsData?.data ?? [];

  const xDates = snapshots.map((s) => s.snapshotDate.split('T')[0] ?? '');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="">Select a project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {projectsLoading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      )}

      {!projectId && !projectsLoading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-20 dark:border-slate-600">
          <p className="text-slate-500 dark:text-slate-400">
            Select a project to view metrics
          </p>
        </div>
      )}

      {projectId && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="AI Success Rate"
              value={overviewLoading ? '...' : toPercent(overview?.aiSuccessRate ?? null)}
              subtitle="PRs merged without major revision"
              color="green"
            />
            <MetricCard
              title="AI Stable Rate"
              value={overviewLoading ? '...' : toPercent(overview?.aiStableRate ?? null)}
              subtitle="PRs without rollback"
              color="blue"
            />
            <MetricCard
              title="PSRI Score"
              value={
                overviewLoading
                  ? '...'
                  : overview?.psriScore != null
                    ? overview.psriScore.toFixed(2)
                    : 'N/A'
              }
              subtitle="Predictive Structural Risk Index"
              color="amber"
            />
            <MetricCard
              title="Total Files"
              value={overviewLoading ? '...' : String(overview?.totalFiles ?? 0)}
              subtitle={`${overview?.hotspotFiles ?? 0} hotspot files`}
              color="indigo"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <LineChart
              title="AI Metrics Trend"
              xData={xDates}
              series={[
                {
                  name: 'AI Success Rate',
                  data: snapshots.map((s) => (s.aiSuccessRate ?? 0) * 100),
                },
                {
                  name: 'AI Stable Rate',
                  data: snapshots.map((s) => (s.aiStableRate ?? 0) * 100),
                },
              ]}
              loading={snapshotsLoading}
            />
            <LineChart
              title="PSRI Trend"
              xData={xDates}
              series={[
                { name: 'PSRI', data: snapshots.map((s) => s.psriScore ?? 0) },
              ]}
              loading={snapshotsLoading}
            />
          </div>
        </>
      )}
    </div>
  );
}
