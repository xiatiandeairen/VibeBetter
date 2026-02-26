'use client';

import { useEffect, useState } from 'react';
import { api, type MetricsOverviewResponse, type ProjectsListResponse } from '@/lib/api';

interface ProjectMetric {
  projectId: string;
  name: string;
  aiSuccessRate: number | null;
  psriScore: number | null;
  tdiScore: number | null;
  aiPrs: number;
  totalPrs: number;
}

function healthBadge(psri: number | null) {
  if (psri === null) return <span className="rounded bg-zinc-700 px-2 py-0.5 text-xs text-zinc-400">N/A</span>;
  if (psri < 0.3) return <span className="rounded bg-emerald-900/50 px-2 py-0.5 text-xs text-emerald-400">Healthy</span>;
  if (psri < 0.6) return <span className="rounded bg-yellow-900/50 px-2 py-0.5 text-xs text-yellow-400">Warning</span>;
  return <span className="rounded bg-red-900/50 px-2 py-0.5 text-xs text-red-400">Critical</span>;
}

function pct(v: number | null) {
  if (v === null) return 'N/A';
  return `${(v * 100).toFixed(1)}%`;
}

function score(v: number | null) {
  if (v === null) return 'N/A';
  return v.toFixed(3);
}

export default function TeamsPage() {
  const [metrics, setMetrics] = useState<ProjectMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const projects = await api.getProjects();
        const results: ProjectMetric[] = [];
        for (const p of projects.data) {
          try {
            const overview = await api.getMetricsOverview(p.id);
            results.push({
              projectId: p.id,
              name: p.name,
              aiSuccessRate: overview.data.aiSuccessRate,
              psriScore: overview.data.psriScore,
              tdiScore: overview.data.tdiScore,
              aiPrs: overview.data.aiPrs,
              totalPrs: overview.data.totalPrs,
            });
          } catch {
            results.push({
              projectId: p.id,
              name: p.name,
              aiSuccessRate: null,
              psriScore: null,
              tdiScore: null,
              aiPrs: 0,
              totalPrs: 0,
            });
          }
        }
        setMetrics(results);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function exportReport() {
    const blob = new Blob([JSON.stringify(metrics, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const avgAiSuccess = metrics.filter(m => m.aiSuccessRate !== null).length > 0
    ? metrics.filter(m => m.aiSuccessRate !== null).reduce((s, m) => s + (m.aiSuccessRate ?? 0), 0) / metrics.filter(m => m.aiSuccessRate !== null).length
    : null;
  const avgPsri = metrics.filter(m => m.psriScore !== null).length > 0
    ? metrics.filter(m => m.psriScore !== null).reduce((s, m) => s + (m.psriScore ?? 0), 0) / metrics.filter(m => m.psriScore !== null).length
    : null;
  const avgTdi = metrics.filter(m => m.tdiScore !== null).length > 0
    ? metrics.filter(m => m.tdiScore !== null).reduce((s, m) => s + (m.tdiScore ?? 0), 0) / metrics.filter(m => m.tdiScore !== null).length
    : null;
  const totalAiPrs = metrics.reduce((s, m) => s + m.aiPrs, 0);
  const totalPrs = metrics.reduce((s, m) => s + m.totalPrs, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Team Comparison</h1>
          <p className="mt-1 text-sm text-zinc-500">Compare performance across all projects</p>
        </div>
        <button
          onClick={exportReport}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Export Team Report
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 rounded-lg bg-zinc-800/50" />
          ))}
        </div>
      ) : metrics.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-500">
          No projects found. Create a project to see team metrics.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-xs uppercase text-zinc-500">
                <th className="px-4 py-3">Project Name</th>
                <th className="px-4 py-3">AI Success Rate</th>
                <th className="px-4 py-3">PSRI</th>
                <th className="px-4 py-3">TDI</th>
                <th className="px-4 py-3">AI PRs</th>
                <th className="px-4 py-3">Total PRs</th>
                <th className="px-4 py-3">Health</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map(m => (
                <tr key={m.projectId} className="border-b border-zinc-800/50 text-zinc-300">
                  <td className="px-4 py-3 font-medium text-zinc-100">{m.name}</td>
                  <td className="px-4 py-3">{pct(m.aiSuccessRate)}</td>
                  <td className="px-4 py-3">{score(m.psriScore)}</td>
                  <td className="px-4 py-3">{score(m.tdiScore)}</td>
                  <td className="px-4 py-3">{m.aiPrs}</td>
                  <td className="px-4 py-3">{m.totalPrs}</td>
                  <td className="px-4 py-3">{healthBadge(m.psriScore)}</td>
                </tr>
              ))}
              <tr className="bg-zinc-800/30 font-medium text-zinc-200">
                <td className="px-4 py-3">Total / Average</td>
                <td className="px-4 py-3">{pct(avgAiSuccess)}</td>
                <td className="px-4 py-3">{score(avgPsri)}</td>
                <td className="px-4 py-3">{score(avgTdi)}</td>
                <td className="px-4 py-3">{totalAiPrs}</td>
                <td className="px-4 py-3">{totalPrs}</td>
                <td className="px-4 py-3">{healthBadge(avgPsri)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
