'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';

export default function DevelopersPage() {
  const projectId = useAppStore((s) => s.selectedProjectId);

  const { data, isLoading } = useQuery({
    queryKey: ['developers', projectId],
    queryFn: () => api.getDevelopers(projectId),
    enabled: !!projectId,
  });

  const developers = data?.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Developer Effectiveness</h1>
        <p className="mt-0.5 text-[13px] text-zinc-500">
          Per-developer AI usage and quality metrics
        </p>
      </div>

      {!projectId && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20">
          <p className="text-sm text-zinc-500">Select a project to view developer data</p>
        </div>
      )}

      {isLoading && projectId && (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      )}

      {!isLoading && projectId && developers.length > 0 && (
        <div className="card-base overflow-hidden">
          <div className="border-b border-zinc-800 px-5 py-3">
            <h2 className="text-[13px] font-semibold text-zinc-300">
              {developers.length} Developer{developers.length !== 1 ? 's' : ''}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="px-5 py-2.5 text-left font-medium text-zinc-500">Name</th>
                  <th className="px-5 py-2.5 text-left font-medium text-zinc-500">Total PRs</th>
                  <th className="px-5 py-2.5 text-left font-medium text-zinc-500">AI PRs</th>
                  <th className="px-5 py-2.5 text-left font-medium text-zinc-500">AI Usage %</th>
                  <th className="px-5 py-2.5 text-left font-medium text-zinc-500">Merge Rate</th>
                  <th className="px-5 py-2.5 text-left font-medium text-zinc-500">Rollback Rate</th>
                </tr>
              </thead>
              <tbody>
                {developers.map((dev) => (
                  <tr
                    key={dev.login}
                    className="border-b border-zinc-800/30 transition-colors hover:bg-zinc-800/20"
                  >
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-semibold text-zinc-300">
                          {dev.login.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-zinc-300">{dev.login}</span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-zinc-400">{dev.totalPrs}</td>
                    <td className="px-5 py-2.5 text-zinc-400">{dev.aiPrs}</td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-indigo-500 transition-all"
                            style={{ width: `${(dev.aiUsageRate * 100).toFixed(0)}%` }}
                          />
                        </div>
                        <span className="text-[12px] font-mono text-zinc-400">
                          {(dev.aiUsageRate * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          dev.mergeRate >= 0.8
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : dev.mergeRate >= 0.5
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {(dev.mergeRate * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-5 py-2.5">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          dev.rollbackRate <= 0.05
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : dev.rollbackRate <= 0.15
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {(dev.rollbackRate * 100).toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && projectId && developers.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20">
          <p className="text-sm text-zinc-500">No developer data available yet</p>
        </div>
      )}
    </div>
  );
}
