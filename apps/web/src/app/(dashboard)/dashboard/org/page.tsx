'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api, type MetricsOverviewResponse } from '@/lib/api';
import { useAppStore } from '@/lib/store';

type SortKey = 'name' | 'aiSuccess' | 'aiStable' | 'psri' | 'tdi' | 'files' | 'hotspots' | 'health';

function getHealth(psri: number | null): { label: string; color: string } {
  if (psri == null) return { label: 'N/A', color: 'text-zinc-500' };
  if (psri <= 0.3) return { label: 'Good', color: 'text-emerald-400' };
  if (psri <= 0.6) return { label: 'Fair', color: 'text-amber-400' };
  return { label: 'At Risk', color: 'text-red-400' };
}

function getHealthDot(psri: number | null): string {
  if (psri == null) return 'bg-zinc-600';
  if (psri <= 0.3) return 'bg-emerald-500';
  if (psri <= 0.6) return 'bg-amber-500';
  return 'bg-red-500';
}

interface ProjectRow {
  id: string;
  name: string;
  aiSuccess: number | null;
  aiStable: number | null;
  psri: number | null;
  tdi: number | null;
  files: number;
  hotspots: number;
}

export default function OrgDashboardPage() {
  const router = useRouter();
  const setProjectId = useAppStore((s) => s.setSelectedProjectId);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  });

  const projects = useMemo(() => projectsData?.data ?? [], [projectsData?.data]);

  const metricsQueries = useQuery({
    queryKey: ['org-overview-all', projects.map((p) => p.id).join(',')],
    queryFn: async () => {
      const results: Record<string, MetricsOverviewResponse['data']> = {};
      await Promise.all(
        projects.map(async (p) => {
          try {
            const res = await api.getMetricsOverview(p.id);
            results[p.id] = res.data;
          } catch {
            results[p.id] = null as unknown as MetricsOverviewResponse['data'];
          }
        }),
      );
      return results;
    },
    enabled: projects.length > 0,
  });

  const rows: ProjectRow[] = useMemo(() => {
    if (!metricsQueries.data) return [];
    return projects.map((p) => {
      const m = metricsQueries.data[p.id];
      return {
        id: p.id,
        name: p.name,
        aiSuccess: m?.aiSuccessRate ?? null,
        aiStable: m?.aiStableRate ?? null,
        psri: m?.psriScore ?? null,
        tdi: m?.tdiScore ?? null,
        files: m?.totalFiles ?? 0,
        hotspots: m?.hotspotFiles ?? 0,
      };
    });
  }, [projects, metricsQueries.data]);

  const sortedRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
      const dir = sortAsc ? 1 : -1;
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortKey === 'health') return ((a.psri ?? 999) - (b.psri ?? 999)) * dir;
      const aVal = a[sortKey] ?? -1;
      const bVal = b[sortKey] ?? -1;
      return (aVal - bVal) * dir;
    });
    return sorted;
  }, [rows, sortKey, sortAsc]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  function handleRowClick(id: string) {
    setProjectId(id);
    router.push('/dashboard');
  }

  const loading = projectsLoading || metricsQueries.isLoading;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Organization Overview</h1>
        <p className="mt-0.5 text-[13px] text-zinc-500">
          All projects at a glance
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      )}

      {!loading && sortedRows.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20">
          <p className="text-sm text-zinc-500">No projects found</p>
        </div>
      )}

      {!loading && sortedRows.length > 0 && (
        <div className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <SortHeader label="Project" sortKey="name" current={sortKey} asc={sortAsc} onClick={handleSort} />
                  <SortHeader label="AI Success" sortKey="aiSuccess" current={sortKey} asc={sortAsc} onClick={handleSort} />
                  <SortHeader label="AI Stable" sortKey="aiStable" current={sortKey} asc={sortAsc} onClick={handleSort} />
                  <SortHeader label="PSRI" sortKey="psri" current={sortKey} asc={sortAsc} onClick={handleSort} />
                  <SortHeader label="TDI" sortKey="tdi" current={sortKey} asc={sortAsc} onClick={handleSort} />
                  <SortHeader label="Files" sortKey="files" current={sortKey} asc={sortAsc} onClick={handleSort} />
                  <SortHeader label="Hotspots" sortKey="hotspots" current={sortKey} asc={sortAsc} onClick={handleSort} />
                  <SortHeader label="Health" sortKey="health" current={sortKey} asc={sortAsc} onClick={handleSort} />
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row) => {
                  const health = getHealth(row.psri);
                  return (
                    <tr
                      key={row.id}
                      onClick={() => handleRowClick(row.id)}
                      className="cursor-pointer border-b border-zinc-800/30 transition-colors hover:bg-zinc-800/20"
                    >
                      <td className="px-5 py-3 font-medium text-indigo-400 hover:underline">
                        {row.name}
                      </td>
                      <td className="px-5 py-3 text-zinc-400">
                        {row.aiSuccess != null ? `${(row.aiSuccess * 100).toFixed(1)}%` : 'N/A'}
                      </td>
                      <td className="px-5 py-3 text-zinc-400">
                        {row.aiStable != null ? `${(row.aiStable * 100).toFixed(1)}%` : 'N/A'}
                      </td>
                      <td className="px-5 py-3 text-zinc-400">
                        {row.psri != null ? row.psri.toFixed(2) : 'N/A'}
                      </td>
                      <td className="px-5 py-3 text-zinc-400">
                        {row.tdi != null ? row.tdi.toFixed(2) : 'N/A'}
                      </td>
                      <td className="px-5 py-3 text-zinc-400">{row.files}</td>
                      <td className="px-5 py-3 text-zinc-400">{row.hotspots}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${getHealthDot(row.psri)}`} />
                          <span className={`text-[12px] font-medium ${health.color}`}>
                            {health.label}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SortHeader({
  label,
  sortKey,
  current,
  asc,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  asc: boolean;
  onClick: (key: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <th
      className="cursor-pointer select-none px-5 py-2.5 text-left font-medium text-zinc-500 transition-colors hover:text-zinc-300"
      onClick={() => onClick(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {active && (
          <svg
            className={`h-3 w-3 transition-transform ${asc ? '' : 'rotate-180'}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        )}
      </div>
    </th>
  );
}
