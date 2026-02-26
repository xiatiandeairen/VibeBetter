'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';

interface TimelinePoint {
  date: string;
  psri: number;
  tdi: number;
  hotspots: number;
  aiSuccessRate: number;
}

export default function TimelinePage() {
  const currentProject = useAppStore((s) => s.currentProject);
  const [data, setData] = useState<TimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<'psri' | 'tdi' | 'hotspots' | 'aiSuccessRate'>('psri');

  useEffect(() => {
    if (!currentProject) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get(`/api/projects/${currentProject}/metrics/history`)
      .then((res) => {
        const history = (res.data as Array<Record<string, unknown>>) ?? [];
        const mapped: TimelinePoint[] = history.map((h) => ({
          date: String(h.date ?? h.createdAt ?? ''),
          psri: Number(h.psriScore ?? h.psri ?? 0),
          tdi: Number(h.tdiScore ?? h.tdi ?? 0),
          hotspots: Number(h.hotspotFiles ?? h.hotspots ?? 0),
          aiSuccessRate: Number(h.aiSuccessRate ?? 0),
        }));
        setData(mapped);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [currentProject]);

  const metrics = [
    { key: 'psri' as const, label: 'PSRI', color: 'bg-indigo-500' },
    { key: 'tdi' as const, label: 'TDI', color: 'bg-amber-500' },
    { key: 'hotspots' as const, label: 'Hotspots', color: 'bg-rose-500' },
    { key: 'aiSuccessRate' as const, label: 'AI Success', color: 'bg-emerald-500' },
  ];

  const maxValue = Math.max(...data.map((d) => d[metric]), 1);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Metric Timeline</h1>
        <p className="mt-1 text-sm text-zinc-500">Track how metrics change over time</p>
      </div>

      {!currentProject && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-500">
          Select a project to view its timeline
        </div>
      )}

      {currentProject && (
        <>
          <div className="flex gap-2">
            {metrics.map((m) => (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  metric === m.key
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="h-64 animate-pulse rounded-lg bg-zinc-800/50" />
          ) : data.length === 0 ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-500">
              No timeline data available. Run <code className="text-zinc-400">vibe sync</code> first.
            </div>
          ) : (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex h-48 items-end gap-1">
                {data.slice(-60).map((point, i) => {
                  const height = maxValue > 0 ? (point[metric] / maxValue) * 100 : 0;
                  const activeColor = metrics.find((m) => m.key === metric)?.color ?? 'bg-indigo-500';
                  return (
                    <div key={i} className="group relative flex flex-1 flex-col items-center justify-end">
                      <div
                        className={`w-full min-w-[3px] rounded-t ${activeColor} opacity-70 transition-opacity group-hover:opacity-100`}
                        style={{ height: `${Math.max(height, 2)}%` }}
                      />
                      <div className="pointer-events-none absolute -top-8 hidden rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-300 group-hover:block">
                        {point[metric].toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex justify-between text-[10px] text-zinc-600">
                <span>{data[0]?.date ? new Date(data[0].date).toLocaleDateString() : ''}</span>
                <span>{data[data.length - 1]?.date ? new Date(data[data.length - 1].date).toLocaleDateString() : ''}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
