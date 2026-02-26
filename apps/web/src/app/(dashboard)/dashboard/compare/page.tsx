'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import type { MetricSnapshotItem } from '@/lib/api';

export default function ComparePage() {
  const projectId = useAppStore((s) => s.selectedProjectId);
  const setProjectId = useAppStore((s) => s.setSelectedProjectId);

  const today = new Date().toISOString().split('T')[0]!;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000)
    .toISOString()
    .split('T')[0]!;
  const sixtyDaysAgo = new Date(Date.now() - 60 * 86_400_000)
    .toISOString()
    .split('T')[0]!;

  const [periodAStart, setPeriodAStart] = useState(sixtyDaysAgo);
  const [periodAEnd, setPeriodAEnd] = useState(thirtyDaysAgo);
  const [periodBStart, setPeriodBStart] = useState(thirtyDaysAgo);
  const [periodBEnd, setPeriodBEnd] = useState(today);

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

  const { data: snapshotsData, isLoading: snapshotsLoading } = useQuery({
    queryKey: ['metric-snapshots', projectId, 'compare'],
    queryFn: () => api.getMetricSnapshots(projectId, 365),
    enabled: !!projectId,
  });

  const snapshots = snapshotsData?.data ?? [];

  function filterByPeriod(start: string, end: string): MetricSnapshotItem[] {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime() + 86_400_000;
    return snapshots.filter((snap) => {
      const d = new Date(snap.snapshotDate).getTime();
      return d >= s && d <= e;
    });
  }

  function avg(
    items: MetricSnapshotItem[],
    key: keyof MetricSnapshotItem,
  ): number | null {
    const vals = items
      .map((i) => i[key])
      .filter((v): v is number => v != null);
    if (vals.length === 0) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  const periodA = filterByPeriod(periodAStart, periodAEnd);
  const periodB = filterByPeriod(periodBStart, periodBEnd);

  const metrics: {
    label: string;
    key: keyof MetricSnapshotItem;
    isPercent: boolean;
    invertDelta: boolean;
  }[] = [
    {
      label: 'AI Success Rate',
      key: 'aiSuccessRate',
      isPercent: true,
      invertDelta: false,
    },
    {
      label: 'AI Stable Rate',
      key: 'aiStableRate',
      isPercent: true,
      invertDelta: false,
    },
    {
      label: 'PSRI',
      key: 'psriScore',
      isPercent: false,
      invertDelta: true,
    },
    {
      label: 'TDI',
      key: 'tdiScore',
      isPercent: false,
      invertDelta: true,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">
            Trend Comparison
          </h1>
          <p className="mt-0.5 text-[13px] text-zinc-500">
            Compare metrics between two periods
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

      {projectsLoading && (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      )}

      {!projectId && !projectsLoading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20">
          <p className="text-sm text-zinc-500">
            Select a project to compare
          </p>
        </div>
      )}

      {projectId && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="card-base p-4">
              <h3 className="mb-3 text-[13px] font-semibold text-zinc-300">
                Period A
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={periodAStart}
                  onChange={(e) => setPeriodAStart(e.target.value)}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[13px] text-zinc-300 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                />
                <span className="text-zinc-600">to</span>
                <input
                  type="date"
                  value={periodAEnd}
                  onChange={(e) => setPeriodAEnd(e.target.value)}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[13px] text-zinc-300 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                />
              </div>
              <p className="mt-2 text-[11px] text-zinc-600">
                {periodA.length} snapshot{periodA.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="card-base p-4">
              <h3 className="mb-3 text-[13px] font-semibold text-zinc-300">
                Period B
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={periodBStart}
                  onChange={(e) => setPeriodBStart(e.target.value)}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[13px] text-zinc-300 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                />
                <span className="text-zinc-600">to</span>
                <input
                  type="date"
                  value={periodBEnd}
                  onChange={(e) => setPeriodBEnd(e.target.value)}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[13px] text-zinc-300 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                />
              </div>
              <p className="mt-2 text-[11px] text-zinc-600">
                {periodB.length} snapshot{periodB.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {snapshotsLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((m) => {
                const valA = avg(periodA, m.key);
                const valB = avg(periodB, m.key);
                const delta =
                  valA != null && valB != null && valA !== 0
                    ? ((valB - valA) / Math.abs(valA)) * 100
                    : null;
                const improved =
                  delta != null
                    ? m.invertDelta
                      ? delta < 0
                      : delta > 0
                    : null;

                return (
                  <div key={m.key} className="card-base p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                      {m.label}
                    </p>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <p className="text-[11px] text-zinc-500">Period A</p>
                        <p className="text-lg font-semibold text-zinc-300">
                          {valA != null
                            ? m.isPercent
                              ? `${(valA * 100).toFixed(1)}%`
                              : valA.toFixed(2)
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-zinc-500">Period B</p>
                        <p className="text-lg font-semibold text-zinc-300">
                          {valB != null
                            ? m.isPercent
                              ? `${(valB * 100).toFixed(1)}%`
                              : valB.toFixed(2)
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {delta != null && (
                      <div className="mt-2 flex justify-center">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            improved
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}
                        >
                          {delta > 0 ? '+' : ''}
                          {delta.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
