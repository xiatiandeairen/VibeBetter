'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';

type Level = 'overview' | 'dimension' | 'file';
type Dimension = 'structural' | 'change' | 'defect';

const DIMENSIONS: { key: Dimension; label: string; color: string }[] = [
  { key: 'structural', label: 'Structural Complexity', color: 'indigo' },
  { key: 'change', label: 'Change Frequency', color: 'amber' },
  { key: 'defect', label: 'Defect Density', color: 'red' },
];

export default function DrilldownPage() {
  const projectId = useAppStore((s) => s.selectedProjectId);
  const setProjectId = useAppStore((s) => s.setSelectedProjectId);
  const [level, setLevel] = useState<Level>('overview');
  const [selectedDimension, setSelectedDimension] =
    useState<Dimension | null>(null);

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  });

  const projects = useMemo(
    () => projectsData?.data ?? [],
    [projectsData?.data],
  );

  useEffect(() => {
    if (!projectId && projects.length === 1 && projects[0]) {
      setProjectId(projects[0].id);
    }
  }, [projectId, projects, setProjectId]);

  const { data: overviewData } = useQuery({
    queryKey: ['metrics-overview', projectId],
    queryFn: () => api.getMetricsOverview(projectId),
    enabled: !!projectId,
  });

  const { data: dimensionFiles, isLoading: dimensionLoading } = useQuery({
    queryKey: ['dimension-files', projectId, selectedDimension],
    queryFn: () => api.getDimensionFiles(projectId, selectedDimension!),
    enabled: !!projectId && !!selectedDimension,
  });

  const overview = overviewData?.data;
  const files = dimensionFiles?.data ?? [];

  function handleDimensionClick(dim: Dimension) {
    setSelectedDimension(dim);
    setLevel('dimension');
  }

  function handleBack() {
    if (level === 'dimension') {
      setLevel('overview');
      setSelectedDimension(null);
    }
  }

  const psriScore = overview?.psriScore;
  const dimensions = overview
    ? [
        {
          key: 'structural' as const,
          label: 'Structural',
          value: overview.psriStructural,
        },
        {
          key: 'change' as const,
          label: 'Change',
          value: overview.psriChange,
        },
        {
          key: 'defect' as const,
          label: 'Defect',
          value: overview.psriDefect,
        },
      ]
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">
            PSRI Drill-Down
          </h1>
          <p className="mt-0.5 text-[13px] text-zinc-500">
            Explore risk dimensions in detail
          </p>
        </div>
        <select
          value={projectId}
          onChange={(e) => {
            setProjectId(e.target.value);
            setLevel('overview');
            setSelectedDimension(null);
          }}
          className="appearance-none rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-3 pr-8 text-[13px] text-zinc-300 transition-colors focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
        >
          <option value="">Select project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[13px]">
        <button
          onClick={() => {
            setLevel('overview');
            setSelectedDimension(null);
          }}
          className={`transition-colors ${level === 'overview' ? 'font-semibold text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          PSRI
        </button>
        {selectedDimension && (
          <>
            <span className="text-zinc-600">/</span>
            <button
              onClick={handleBack}
              className={`transition-colors ${level === 'dimension' ? 'font-semibold text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {DIMENSIONS.find((d) => d.key === selectedDimension)?.label}
            </button>
          </>
        )}
      </nav>

      {projectsLoading && (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      )}

      {!projectId && !projectsLoading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20">
          <p className="text-sm text-zinc-500">
            Select a project to drill down
          </p>
        </div>
      )}

      {projectId && level === 'overview' && (
        <>
          <div className="card-base p-6">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold ${
                  (psriScore ?? 0) > 0.6
                    ? 'bg-red-500/10 text-red-400'
                    : (psriScore ?? 0) > 0.3
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-emerald-500/10 text-emerald-400'
                }`}
              >
                {psriScore != null ? psriScore.toFixed(2) : 'N/A'}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">
                  Overall PSRI Score
                </h2>
                <p className="text-[13px] text-zinc-500">
                  Predictive Structural Risk Index
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {dimensions.map((dim) => {
              const val = dim.value ?? 0;
              const cfg = DIMENSIONS.find((d) => d.key === dim.key)!;
              const barColor =
                cfg.color === 'indigo'
                  ? 'bg-indigo-500'
                  : cfg.color === 'amber'
                    ? 'bg-amber-500'
                    : 'bg-red-500';
              return (
                <button
                  key={dim.key}
                  onClick={() => handleDimensionClick(dim.key)}
                  className="card-base w-full p-4 text-left transition-colors hover:bg-zinc-800/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-zinc-300">
                      {dim.label}
                    </span>
                    <span className="text-[13px] text-zinc-500">
                      {(val * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className={`h-full rounded-full ${barColor} transition-all duration-500`}
                      style={{ width: `${Math.min(val * 100, 100)}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {projectId && level === 'dimension' && (
        <>
          {dimensionLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20">
              <p className="text-sm text-zinc-500">No files found</p>
            </div>
          ) : (
            <div className="card-base overflow-hidden">
              <div className="border-b border-zinc-800 px-5 py-3">
                <h2 className="text-[13px] font-semibold text-zinc-300">
                  Files contributing to{' '}
                  {DIMENSIONS.find((d) => d.key === selectedDimension)?.label}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-zinc-800/60">
                      <th className="px-4 py-2.5 text-left font-medium text-zinc-500">
                        File Path
                      </th>
                      <th className="px-4 py-2.5 text-left font-medium text-zinc-500">
                        Complexity
                      </th>
                      <th className="px-4 py-2.5 text-left font-medium text-zinc-500">
                        Changes (90d)
                      </th>
                      <th className="px-4 py-2.5 text-left font-medium text-zinc-500">
                        LOC
                      </th>
                      <th className="px-4 py-2.5 text-left font-medium text-zinc-500">
                        Authors
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file) => (
                      <tr
                        key={file.filePath}
                        className="border-b border-zinc-800/30 transition-colors hover:bg-zinc-800/20"
                      >
                        <td className="max-w-[300px] truncate px-4 py-2.5 font-mono text-xs text-zinc-400">
                          {file.filePath}
                        </td>
                        <td className="px-4 py-2.5 text-zinc-400">
                          {file.cyclomaticComplexity}
                        </td>
                        <td className="px-4 py-2.5 text-zinc-400">
                          {file.changeFrequency90d}
                        </td>
                        <td className="px-4 py-2.5 text-zinc-400">
                          {file.linesOfCode}
                        </td>
                        <td className="px-4 py-2.5 text-zinc-400">
                          {file.authorCount}
                        </td>
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
