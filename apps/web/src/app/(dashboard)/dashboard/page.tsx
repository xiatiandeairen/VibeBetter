'use client';

import { useState, useEffect, useMemo } from 'react';
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

  const projects = useMemo(() => projectsData?.data ?? [], [projectsData?.data]);

  useEffect(() => {
    if (!projectId && projects.length === 1 && projects[0]) {
      setProjectId(projects[0].id);
    }
  }, [projectId, projects]);

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

  const { data: topFilesData } = useQuery({
    queryKey: ['top-files', projectId],
    queryFn: () => api.getTopFiles(projectId),
    enabled: !!projectId,
  });

  const overview = overviewData?.data;
  const snapshots = snapshotsData?.data ?? [];
  const topFiles = topFilesData?.data ?? [];
  const xDates = snapshots.map((s) => s.snapshotDate.split('T')[0] ?? '');

  const latestSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
  const prevSnapshot = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;

  function getDelta(current: number | null | undefined, previous: number | null | undefined): number | null {
    if (current == null || previous == null || previous === 0) return null;
    return ((current - previous) / Math.abs(previous)) * 100;
  }

  const successDelta = getDelta(latestSnapshot?.aiSuccessRate, prevSnapshot?.aiSuccessRate);
  const stableDelta = getDelta(latestSnapshot?.aiStableRate, prevSnapshot?.aiStableRate);
  const psriDelta = getDelta(latestSnapshot?.psriScore, prevSnapshot?.psriScore);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Overview</h1>
          <p className="mt-0.5 text-[13px] text-zinc-500">Project metrics and insights</p>
        </div>
        <div className="relative">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="appearance-none rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-8 text-[13px] text-zinc-300 transition-colors focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
          >
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {projectsLoading && (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      )}

      {!projectId && !projectsLoading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20">
          <svg className="mb-3 h-8 w-8 text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          <p className="text-sm text-zinc-500">Select a project to view metrics</p>
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
              delta={successDelta}
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <MetricCard
              title="AI Stable Rate"
              value={overviewLoading ? '...' : toPercent(overview?.aiStableRate ?? null)}
              subtitle="PRs without rollback"
              color="blue"
              delta={stableDelta}
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              }
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
              subtitle="Predictive Structural Risk"
              color="amber"
              delta={psriDelta}
              invertDelta
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              }
            />
            <MetricCard
              title="Total Files"
              value={overviewLoading ? '...' : String(overview?.totalFiles ?? 0)}
              subtitle={`${overview?.hotspotFiles ?? 0} hotspot files`}
              color="violet"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <QuickStat label="Total PRs" value={overview?.totalPrs ?? 0} />
            <QuickStat label="AI PRs" value={overview?.aiPrs ?? 0} />
            <QuickStat label="Avg Complexity" value={latestSnapshot?.totalFiles ? '~' : 'N/A'} />
            <QuickStat label="Hotspot Count" value={overview?.hotspotFiles ?? 0} />
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
              series={[{ name: 'PSRI', data: snapshots.map((s) => s.psriScore ?? 0) }]}
              loading={snapshotsLoading}
            />
          </div>

          {topFiles.length > 0 && (
            <div className="card-base overflow-hidden">
              <div className="border-b border-zinc-800 px-5 py-3">
                <h2 className="text-[13px] font-semibold text-zinc-300">Top Risk Files</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-zinc-800/60">
                      <th className="px-5 py-2.5 text-left font-medium text-zinc-500">File Path</th>
                      <th className="px-5 py-2.5 text-left font-medium text-zinc-500">Complexity</th>
                      <th className="px-5 py-2.5 text-left font-medium text-zinc-500">Changes</th>
                      <th className="px-5 py-2.5 text-left font-medium text-zinc-500">LOC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topFiles.slice(0, 5).map((file) => (
                      <tr key={file.filePath} className="border-b border-zinc-800/30 transition-colors hover:bg-zinc-800/20">
                        <td className="max-w-[260px] truncate px-5 py-2.5 font-mono text-xs text-zinc-400">
                          {file.filePath}
                        </td>
                        <td className="px-5 py-2.5 text-zinc-400">{file.cyclomaticComplexity}</td>
                        <td className="px-5 py-2.5 text-zinc-400">{file.changeFrequency90d}</td>
                        <td className="px-5 py-2.5 text-zinc-400">{file.linesOfCode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card-base px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">{label}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-200">{value}</p>
    </div>
  );
}
