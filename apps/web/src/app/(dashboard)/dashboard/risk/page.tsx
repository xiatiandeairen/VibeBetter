'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AreaChart } from '@/components/charts/area-chart';

export default function RiskTrendsPage() {
  const [projectId, setProjectId] = useState('');

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  });

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

  const projects = projectsData?.data ?? [];
  const snapshots = snapshotsData?.data ?? [];
  const topFiles = topFilesData?.data ?? [];

  const xDates = snapshots.map((s) => s.snapshotDate.split('T')[0] ?? '');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Risk Trends</h1>
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

      {!projectId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-20 dark:border-slate-600">
          <p className="text-slate-500 dark:text-slate-400">Select a project to view risk trends</p>
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

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h2 className="font-semibold text-slate-900 dark:text-white">Top 10 Hotspot Files</h2>
            </div>
            {topFilesLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              </div>
            ) : topFiles.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-slate-500">
                No file metrics data available
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                      <th className="px-6 py-3 font-medium text-slate-500 dark:text-slate-400">
                        File Path
                      </th>
                      <th className="px-6 py-3 font-medium text-slate-500 dark:text-slate-400">
                        Complexity
                      </th>
                      <th className="px-6 py-3 font-medium text-slate-500 dark:text-slate-400">
                        Changes (90d)
                      </th>
                      <th className="px-6 py-3 font-medium text-slate-500 dark:text-slate-400">
                        LOC
                      </th>
                      <th className="px-6 py-3 font-medium text-slate-500 dark:text-slate-400">
                        Authors
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topFiles.map((file) => (
                      <tr
                        key={file.filePath}
                        className="border-b border-slate-100 last:border-0 dark:border-slate-700/50"
                      >
                        <td className="max-w-[300px] truncate px-6 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">
                          {file.filePath}
                        </td>
                        <td className="px-6 py-3 text-slate-600 dark:text-slate-400">
                          {file.cyclomaticComplexity}
                        </td>
                        <td className="px-6 py-3 text-slate-600 dark:text-slate-400">
                          {file.changeFrequency90d}
                        </td>
                        <td className="px-6 py-3 text-slate-600 dark:text-slate-400">
                          {file.linesOfCode}
                        </td>
                        <td className="px-6 py-3 text-slate-600 dark:text-slate-400">
                          {file.authorCount}
                        </td>
                      </tr>
                    ))}
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
