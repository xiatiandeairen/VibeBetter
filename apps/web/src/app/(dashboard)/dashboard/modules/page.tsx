'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';

interface ModuleGroup {
  directory: string;
  files: number;
  avgComplexity: number;
  hotspots: number;
  riskScore: number;
}

export default function ModulesPage() {
  const currentProject = useAppStore((s) => s.currentProject);
  const [modules, setModules] = useState<ModuleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'riskScore' | 'files' | 'hotspots'>('riskScore');

  useEffect(() => {
    if (!currentProject) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get(`/api/projects/${currentProject}/files`)
      .then((res) => {
        const files = (res.data as Array<Record<string, unknown>>) ?? [];
        const groups = new Map<string, { files: number; complexity: number; hotspots: number; risk: number }>();

        for (const f of files) {
          const path = String(f.filePath ?? f.path ?? '');
          const parts = path.split('/');
          const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '/';
          const entry = groups.get(dir) ?? { files: 0, complexity: 0, hotspots: 0, risk: 0 };
          entry.files++;
          entry.complexity += Number(f.complexity ?? 0);
          entry.risk += Number(f.riskScore ?? f.risk ?? 0);
          if (Number(f.complexity ?? 0) > 20 || Number(f.churnCount ?? 0) > 10) entry.hotspots++;
          groups.set(dir, entry);
        }

        const mapped: ModuleGroup[] = Array.from(groups.entries()).map(([dir, g]) => ({
          directory: dir,
          files: g.files,
          avgComplexity: g.files > 0 ? g.complexity / g.files : 0,
          hotspots: g.hotspots,
          riskScore: g.files > 0 ? g.risk / g.files : 0,
        }));

        setModules(mapped);
      })
      .catch(() => setModules([]))
      .finally(() => setLoading(false));
  }, [currentProject]);

  const sorted = [...modules].sort((a, b) => b[sortBy] - a[sortBy]);

  function riskColor(score: number): string {
    if (score >= 70) return 'text-rose-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-emerald-400';
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Modules</h1>
        <p className="mt-1 text-sm text-zinc-500">Files grouped by directory with per-module risk aggregation</p>
      </div>

      {!currentProject && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-500">
          Select a project to view modules
        </div>
      )}

      {currentProject && (
        <>
          <div className="flex gap-2">
            {(['riskScore', 'files', 'hotspots'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  sortBy === key
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
                }`}
              >
                {key === 'riskScore' ? 'Risk' : key === 'files' ? 'File Count' : 'Hotspots'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-zinc-800/50" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-500">
              No module data available. Run <code className="text-zinc-400">vibe sync</code> first.
            </div>
          ) : (
            <div className="space-y-1">
              {sorted.map((mod) => (
                <div
                  key={mod.directory}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 transition-colors hover:bg-zinc-800/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-200">{mod.directory}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {mod.files} files · {mod.hotspots} hotspots · avg complexity {mod.avgComplexity.toFixed(1)}
                    </p>
                  </div>
                  <span className={`ml-4 text-sm font-semibold ${riskColor(mod.riskScore)}`}>
                    {mod.riskScore.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
