'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';

export default function FilesPage() {
  const projectId = useAppStore((s) => s.selectedProjectId);
  const setProjectId = useAppStore((s) => s.setSelectedProjectId);
  const [search, setSearch] = useState('');

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

  const { data: filesData, isLoading: filesLoading } = useQuery({
    queryKey: ['all-files', projectId],
    queryFn: () => api.getTopFiles(projectId, 100),
    enabled: !!projectId,
  });

  const allFiles = useMemo(() => {
    const raw = filesData?.data ?? [];
    return raw
      .map((f) => ({
        ...f,
        riskScore: f.cyclomaticComplexity * f.changeFrequency90d,
      }))
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [filesData?.data]);

  const filteredFiles = useMemo(() => {
    if (!search) return allFiles;
    const q = search.toLowerCase();
    return allFiles.filter((f) => f.filePath.toLowerCase().includes(q));
  }, [allFiles, search]);

  function riskBadge(score: number) {
    if (score > 200)
      return (
        <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-400 ring-1 ring-inset ring-red-500/20">
          High
        </span>
      );
    if (score > 50)
      return (
        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400 ring-1 ring-inset ring-amber-500/20">
          Medium
        </span>
      );
    return (
      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
        Low
      </span>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Files</h1>
          <p className="mt-0.5 text-[13px] text-zinc-500">
            Tracked files sorted by risk score
          </p>
        </div>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
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

      {(projectsLoading || filesLoading) && (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      )}

      {!projectId && !projectsLoading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20">
          <p className="text-sm text-zinc-500">
            Select a project to view files
          </p>
        </div>
      )}

      {projectId && !filesLoading && (
        <>
          <div>
            <input
              type="text"
              placeholder="Filter by file path..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
            />
          </div>

          {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20">
              <p className="text-sm text-zinc-500">No files found</p>
            </div>
          ) : (
            <div className="card-base overflow-hidden">
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
                      <th className="px-4 py-2.5 text-left font-medium text-zinc-500">
                        AI%
                      </th>
                      <th className="px-4 py-2.5 text-left font-medium text-zinc-500">
                        Risk
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.map((file) => (
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
                        <td className="px-4 py-2.5 text-zinc-400">
                          {file.aiCodeRatio != null
                            ? `${(file.aiCodeRatio * 100).toFixed(0)}%`
                            : '—'}
                        </td>
                        <td className="px-4 py-2.5">
                          {riskBadge(file.riskScore)}
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
