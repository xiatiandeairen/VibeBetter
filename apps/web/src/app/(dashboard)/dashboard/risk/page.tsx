'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AreaChart } from '@/components/charts/area-chart';

function riskColor(complexity: number, changes: number): string {
  const score = complexity * 0.4 + changes * 0.6;
  if (score > 20) return 'text-red-400';
  if (score > 10) return 'text-amber-400';
  return 'text-emerald-400';
}

function riskBadge(complexity: number, changes: number): { label: string; cls: string } {
  const score = complexity * 0.4 + changes * 0.6;
  if (score > 20) return { label: 'High', cls: 'bg-red-500/10 text-red-400 ring-red-500/20' };
  if (score > 10) return { label: 'Medium', cls: 'bg-amber-500/10 text-amber-400 ring-amber-500/20' };
  return { label: 'Low', cls: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' };
}

export default function RiskTrendsPage() {
  const [projectId, setProjectId] = useState('');

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  });

  const projects = projectsData?.data ?? [];

  useEffect(() => {
    if (!projectId && projects.length === 1 && projects[0]) {
      setProjectId(projects[0].id);
    }
  }, [projectId, projects]);

  const { data: snapshotsData, isLoading: snapshotsLoading } = useQuery({
    queryKey: ['metric-snapshots', projectId],
    queryFn: () => api.getMetricSnapshots(projectId),
    enabled: !!projectId,
  });

  const { data: topFilesData, isLoading: topFilesLoading } = useQuery({
    queryKey: ['top-files', projectId],
    queryFn: () => api.getTopFiles(projectId),
    enabled: !!projectId,
  });

  const snapshots = snapshotsData?.data ?? [];
  const topFiles = topFilesData?.data ?? [];
  const xDates = snapshots.map((s) => s.snapshotDate.split('T')[0] ?? '');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Risk Trends</h1>
          <p className="mt-0.5 text-[13px] text-zinc-500">Structural risk analysis and hotspot detection</p>
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

      {!projectId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20">
          <svg className="mb-3 h-8 w-8 text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <p className="text-sm text-zinc-500">Select a project to view risk trends</p>
        </div>
      ) : (
        <>
          <AreaChart
            title="PSRI Sub-dimensions Trend"
            xData={xDates}
            series={[
              { name: 'Structural', data: snapshots.map((s) => s.psriStructural ?? 0) },
              { name: 'Change', data: snapshots.map((s) => s.psriChange ?? 0) },
              { name: 'Defect', data: snapshots.map((s) => s.psriDefect ?? 0) },
            ]}
            loading={snapshotsLoading}
          />

          <div className="card-base overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
              <h2 className="text-[13px] font-semibold text-zinc-300">Top 10 Hotspot Files</h2>
              <span className="text-[11px] text-zinc-600">{topFiles.length} files</span>
            </div>
            {topFilesLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              </div>
            ) : topFiles.length === 0 ? (
              <div className="px-5 py-12 text-center text-[13px] text-zinc-600">
                No file metrics data available
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-zinc-800/60">
                      <th className="px-5 py-2.5 text-left font-medium text-zinc-500">File Path</th>
                      <th className="px-5 py-2.5 text-left font-medium text-zinc-500">Risk</th>
                      <th className="px-5 py-2.5 text-left font-medium text-zinc-500">Complexity</th>
                      <th className="px-5 py-2.5 text-left font-medium text-zinc-500">Changes (90d)</th>
                      <th className="px-5 py-2.5 text-left font-medium text-zinc-500">LOC</th>
                      <th className="px-5 py-2.5 text-left font-medium text-zinc-500">Authors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topFiles.map((file) => {
                      const badge = riskBadge(file.cyclomaticComplexity, file.changeFrequency90d);
                      return (
                        <tr
                          key={file.filePath}
                          className="border-b border-zinc-800/30 transition-colors hover:bg-zinc-800/20"
                        >
                          <td className="max-w-[300px] truncate px-5 py-2.5 font-mono text-xs text-zinc-400">
                            {file.filePath}
                          </td>
                          <td className="px-5 py-2.5">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${badge.cls}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className={`px-5 py-2.5 ${riskColor(file.cyclomaticComplexity, file.changeFrequency90d)}`}>
                            {file.cyclomaticComplexity}
                          </td>
                          <td className="px-5 py-2.5 text-zinc-400">{file.changeFrequency90d}</td>
                          <td className="px-5 py-2.5 text-zinc-400">{file.linesOfCode}</td>
                          <td className="px-5 py-2.5 text-zinc-400">{file.authorCount}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
