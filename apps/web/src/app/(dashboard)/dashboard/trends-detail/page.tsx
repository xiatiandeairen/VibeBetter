'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';

interface TrendPoint {
  date: string;
  psri: number;
  tdi: number;
  hotspots: number;
  aiSuccessRate: number;
}

interface Annotation {
  date: string;
  label: string;
}

export default function TrendsDetailPage() {
  const currentProject = useAppStore((s) => s.currentProject);
  const [data, setData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<'psri' | 'tdi' | 'hotspots' | 'aiSuccessRate'>('psri');
  const [zoomStart, setZoomStart] = useState(0);
  const [zoomEnd, setZoomEnd] = useState(100);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [newAnnotation, setNewAnnotation] = useState('');

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
        const mapped: TrendPoint[] = history.map((h) => ({
          date: String(h.date ?? h.createdAt ?? ''),
          psri: Number(h.psriScore ?? h.psri ?? 0),
          tdi: Number(h.tdiScore ?? h.tdi ?? 0),
          hotspots: Number(h.hotspotFiles ?? h.hotspots ?? 0),
          aiSuccessRate: Number(h.aiSuccessRate ?? 0),
        }));
        setData(mapped);
        setZoomEnd(mapped.length);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [currentProject]);

  const zoomed = data.slice(zoomStart, zoomEnd);
  const maxValue = Math.max(...zoomed.map((d) => d[metric]), 1);
  const minValue = Math.min(...zoomed.map((d) => d[metric]), 0);

  const metrics = [
    { key: 'psri' as const, label: 'PSRI', color: 'bg-indigo-500' },
    { key: 'tdi' as const, label: 'TDI', color: 'bg-amber-500' },
    { key: 'hotspots' as const, label: 'Hotspots', color: 'bg-rose-500' },
    { key: 'aiSuccessRate' as const, label: 'AI Success', color: 'bg-emerald-500' },
  ];

  function addAnnotation(idx: number) {
    if (!newAnnotation.trim() || !zoomed[idx]) return;
    setAnnotations((prev) => [...prev, { date: zoomed[idx].date, label: newAnnotation.trim() }]);
    setNewAnnotation('');
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Trend Analysis</h1>
        <p className="mt-1 text-sm text-zinc-500">Detailed trends with zoom and annotations</p>
      </div>

      {!currentProject && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-500">
          Select a project to view trend analysis
        </div>
      )}

      {currentProject && (
        <>
          <div className="flex items-center gap-4">
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
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-zinc-500">Zoom</label>
            <input
              type="range"
              min={0}
              max={Math.max(data.length - 1, 0)}
              value={zoomStart}
              onChange={(e) => setZoomStart(Math.min(Number(e.target.value), zoomEnd - 1))}
              className="h-1 flex-1 accent-indigo-500"
            />
            <input
              type="range"
              min={1}
              max={data.length}
              value={zoomEnd}
              onChange={(e) => setZoomEnd(Math.max(Number(e.target.value), zoomStart + 1))}
              className="h-1 flex-1 accent-indigo-500"
            />
            <span className="text-xs text-zinc-500">
              {zoomStart}–{zoomEnd} of {data.length}
            </span>
          </div>

          {loading ? (
            <div className="h-64 animate-pulse rounded-lg bg-zinc-800/50" />
          ) : zoomed.length === 0 ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-500">
              No trend data available. Run <code className="text-zinc-400">vibe sync</code> first.
            </div>
          ) : (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-2 flex justify-between text-[10px] text-zinc-500">
                <span>{maxValue.toFixed(2)}</span>
                <span>{minValue.toFixed(2)}</span>
              </div>
              <div className="flex h-56 items-end gap-[2px]">
                {zoomed.map((point, i) => {
                  const height = maxValue > 0 ? (point[metric] / maxValue) * 100 : 0;
                  const activeColor = metrics.find((m) => m.key === metric)?.color ?? 'bg-indigo-500';
                  const hasAnnotation = annotations.some((a) => a.date === point.date);
                  return (
                    <div
                      key={i}
                      className="group relative flex flex-1 flex-col items-center justify-end"
                      onClick={() => addAnnotation(i)}
                    >
                      {hasAnnotation && <div className="absolute -top-1 h-1.5 w-1.5 rounded-full bg-yellow-400" />}
                      <div
                        className={`w-full min-w-[2px] rounded-t ${activeColor} opacity-70 transition-opacity group-hover:opacity-100`}
                        style={{ height: `${Math.max(height, 2)}%` }}
                      />
                      <div className="pointer-events-none absolute -top-10 z-10 hidden rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-300 group-hover:block">
                        {point[metric].toFixed(2)}
                        <br />
                        {point.date ? new Date(point.date).toLocaleDateString() : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex justify-between text-[10px] text-zinc-600">
                <span>{zoomed[0]?.date ? new Date(zoomed[0].date).toLocaleDateString() : ''}</span>
                <span>{zoomed[zoomed.length - 1]?.date ? new Date(zoomed[zoomed.length - 1].date).toLocaleDateString() : ''}</span>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <h3 className="mb-3 text-sm font-medium text-zinc-300">Annotations</h3>
            <div className="mb-3 flex gap-2">
              <input
                value={newAnnotation}
                onChange={(e) => setNewAnnotation(e.target.value)}
                placeholder="Click a bar to annotate..."
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            {annotations.length === 0 ? (
              <p className="text-xs text-zinc-600">No annotations yet. Type a note and click a bar to add one.</p>
            ) : (
              <div className="space-y-1">
                {annotations.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-500">{a.date ? new Date(a.date).toLocaleDateString() : ''}</span>
                    <span className="text-zinc-300">{a.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
