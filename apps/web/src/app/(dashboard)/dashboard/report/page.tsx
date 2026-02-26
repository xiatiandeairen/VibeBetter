'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { getBenchmarkLevel } from '@vibebetter/shared';

function BenchmarkBadge({ metric, value }: { metric: 'aiSuccessRate' | 'aiStableRate' | 'psriScore' | 'tdiScore'; value: number | null }) {
  if (value === null) return <span className="text-xs text-zinc-600">N/A</span>;
  const level = getBenchmarkLevel(metric as 'aiSuccessRate' | 'psriScore', value);
  const colors: Record<string, string> = {
    Excellent: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    Good: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
    Average: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
    Poor: 'bg-red-500/10 text-red-400 ring-red-500/20',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${colors[level] ?? ''}`}>
      {level}
    </span>
  );
}

export default function ReportPage() {
  const [projectId, setProjectId] = useState('');

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  });

  const projects = useMemo(() => projectsData?.data ?? [], [projectsData?.data]);

  useEffect(() => {
    if (!projectId && projects.length === 1 && projects[0]) {
      setProjectId(projects[0].id);
    }
  }, [projectId, projects]);

  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['metrics-overview', projectId],
    queryFn: () => api.getMetricsOverview(projectId),
    enabled: !!projectId,
  });

  const { data: attributionData } = useQuery({
    queryKey: ['attribution', projectId],
    queryFn: () => api.getAttribution(projectId),
    enabled: !!projectId,
  });

  const { data: topFilesData } = useQuery({
    queryKey: ['top-files', projectId],
    queryFn: () => api.getTopFiles(projectId, 5),
    enabled: !!projectId,
  });

  const { data: decisionsData } = useQuery({
    queryKey: ['decisions', projectId],
    queryFn: () => api.getDecisions(projectId),
    enabled: !!projectId,
  });

  const metrics = metricsData?.data;
  const attribution = attributionData?.data as Record<string, unknown> | undefined;
  const topFiles = topFilesData?.data ?? [];
  const decisions = decisionsData?.data ?? [];
  const selectedProject = projects.find((p) => p.id === projectId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">AI Coding Health Report</h1>
          <p className="mt-0.5 text-[13px] text-zinc-500">
            {selectedProject ? selectedProject.name : 'Select a project'} &mdash;{' '}
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative no-print">
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="appearance-none rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-3 pr-8 text-[13px] text-zinc-300 transition-colors focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
            >
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <Button
            variant="secondary"
            onClick={() => window.print()}
            className="no-print"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 12h.008v.008h-.008V12zm-8.25 0h.008v.008H10.5V12z" />
            </svg>
            Print Report
          </Button>
        </div>
      </div>

      {!projectId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20">
          <svg className="mb-3 h-8 w-8 text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-sm text-zinc-500">Select a project to generate report</p>
        </div>
      ) : metricsLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Section 1: Key Metrics */}
          <div>
            <h2 className="mb-4 text-sm font-semibold text-zinc-300">Key Metrics</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="card-base p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">AI Success Rate</span>
                  <BenchmarkBadge metric="aiSuccessRate" value={metrics?.aiSuccessRate ?? null} />
                </div>
                <p className="mt-3 text-3xl font-bold text-zinc-100">
                  {metrics?.aiSuccessRate !== null && metrics?.aiSuccessRate !== undefined
                    ? `${(metrics.aiSuccessRate * 100).toFixed(1)}%`
                    : 'N/A'}
                </p>
              </div>
              <div className="card-base p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">Stable Rate</span>
                  <BenchmarkBadge metric="aiStableRate" value={metrics?.aiStableRate ?? null} />
                </div>
                <p className="mt-3 text-3xl font-bold text-zinc-100">
                  {metrics?.aiStableRate !== null && metrics?.aiStableRate !== undefined
                    ? `${(metrics.aiStableRate * 100).toFixed(1)}%`
                    : 'N/A'}
                </p>
              </div>
              <div className="card-base p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">PSRI Score</span>
                  <BenchmarkBadge metric="psriScore" value={metrics?.psriScore ?? null} />
                </div>
                <p className="mt-3 text-3xl font-bold text-zinc-100">
                  {metrics?.psriScore !== null && metrics?.psriScore !== undefined
                    ? metrics.psriScore.toFixed(3)
                    : 'N/A'}
                </p>
              </div>
              <div className="card-base p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">TDI Score</span>
                  <BenchmarkBadge metric="tdiScore" value={metrics?.tdiScore ?? null} />
                </div>
                <p className="mt-3 text-3xl font-bold text-zinc-100">
                  {metrics?.tdiScore !== null && metrics?.tdiScore !== undefined
                    ? metrics.tdiScore.toFixed(3)
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: AI Attribution Summary */}
          <div>
            <h2 className="mb-4 text-sm font-semibold text-zinc-300">AI Attribution Summary</h2>
            <div className="card-base p-6">
              {attribution ? (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="mb-3 text-xs font-medium text-zinc-500">AI-Generated Code</h3>
                    <div className="space-y-2">
                      {Object.entries(attribution).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-[13px] text-zinc-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-[13px] font-medium text-zinc-200">
                            {typeof val === 'number' ? (val < 1 ? `${(val * 100).toFixed(1)}%` : val.toFixed(0)) : String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-3 text-xs font-medium text-zinc-500">Overview</h3>
                    <p className="text-sm leading-relaxed text-zinc-400">
                      {metrics && (
                        <>
                          Out of {metrics.totalPrs} total pull requests, {metrics.aiPrs} ({metrics.totalPrs > 0 ? ((metrics.aiPrs / metrics.totalPrs) * 100).toFixed(1) : 0}%) involved AI-assisted code generation.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-500">No attribution data available</p>
              )}
            </div>
          </div>

          {/* Section 3: Risk Summary — Top 5 Hotspot Files */}
          <div>
            <h2 className="mb-4 text-sm font-semibold text-zinc-300">Risk Summary — Top Hotspot Files</h2>
            <div className="card-base overflow-hidden">
              {topFiles.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800 text-left">
                      <th className="px-5 py-3 text-xs font-medium text-zinc-500">File</th>
                      <th className="px-5 py-3 text-xs font-medium text-zinc-500">Complexity</th>
                      <th className="px-5 py-3 text-xs font-medium text-zinc-500">Changes (90d)</th>
                      <th className="px-5 py-3 text-xs font-medium text-zinc-500">LOC</th>
                      <th className="px-5 py-3 text-xs font-medium text-zinc-500">Authors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topFiles.map((f) => (
                      <tr key={f.filePath} className="border-b border-zinc-800/50 last:border-0">
                        <td className="px-5 py-3 font-mono text-[13px] text-zinc-300">{f.filePath}</td>
                        <td className="px-5 py-3 text-[13px] text-zinc-400">{f.cyclomaticComplexity}</td>
                        <td className="px-5 py-3 text-[13px] text-zinc-400">{f.changeFrequency90d}</td>
                        <td className="px-5 py-3 text-[13px] text-zinc-400">{f.linesOfCode}</td>
                        <td className="px-5 py-3 text-[13px] text-zinc-400">{f.authorCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-5 py-8 text-center text-sm text-zinc-500">No file metrics available</p>
              )}
            </div>
          </div>

          {/* Section 4: Recommendations */}
          <div>
            <h2 className="mb-4 text-sm font-semibold text-zinc-300">Recommendations</h2>
            <div className="space-y-3">
              {decisions.length > 0 ? (
                decisions.slice(0, 8).map((d) => (
                  <div key={d.id} className="card-base p-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        d.priority >= 8
                          ? 'bg-red-500/10 text-red-400'
                          : d.priority >= 5
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {d.priority}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-zinc-200">{d.title}</h3>
                          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-500">{d.category}</span>
                        </div>
                        <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">{d.description}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card-base px-5 py-8 text-center">
                  <p className="text-sm text-zinc-500">No recommendations available. Generate decisions first.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
