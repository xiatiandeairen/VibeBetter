'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';

type ActivityType = 'pr' | 'decision' | 'collection' | 'metric' | 'unknown';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
}

const TYPE_STYLES: Record<ActivityType, { label: string; bg: string; text: string }> = {
  pr: { label: 'PR', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  decision: { label: 'Decision', bg: 'bg-violet-500/10', text: 'text-violet-400' },
  collection: { label: 'Collection', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  metric: { label: 'Metric', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  unknown: { label: 'Event', bg: 'bg-zinc-500/10', text: 'text-zinc-400' },
};

function classifyActivity(item: Record<string, unknown>): ActivityType {
  const type = String(item.type ?? item.kind ?? '').toLowerCase();
  if (type.includes('pr') || type.includes('pull')) return 'pr';
  if (type.includes('decision')) return 'decision';
  if (type.includes('collect') || type.includes('job')) return 'collection';
  if (type.includes('metric') || type.includes('snapshot')) return 'metric';
  return 'unknown';
}

export default function ActivityPage() {
  const currentProject = useAppStore((s) => s.currentProject);
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ActivityType | 'all'>('all');

  useEffect(() => {
    if (!currentProject) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const endpoints = [
      api.get(`/api/projects/${currentProject}/prs`).catch(() => ({ data: [] })),
      api.get(`/api/projects/${currentProject}/decisions`).catch(() => ({ data: [] })),
      api.get(`/api/projects/${currentProject}/collection-jobs`).catch(() => ({ data: [] })),
    ];

    Promise.all(endpoints)
      .then(([prs, decisions, jobs]) => {
        const all: ActivityItem[] = [];

        for (const pr of ((prs.data as Array<Record<string, unknown>>) ?? [])) {
          all.push({
            id: `pr-${pr.id ?? pr.number}`,
            type: 'pr',
            title: String(pr.title ?? `PR #${pr.number}`),
            description: String(pr.author ?? pr.user ?? ''),
            timestamp: String(pr.mergedAt ?? pr.createdAt ?? ''),
          });
        }

        for (const d of ((decisions.data as Array<Record<string, unknown>>) ?? [])) {
          all.push({
            id: `dec-${d.id}`,
            type: 'decision',
            title: String(d.title ?? d.category ?? 'Decision'),
            description: String(d.status ?? ''),
            timestamp: String(d.createdAt ?? ''),
          });
        }

        for (const j of ((jobs.data as Array<Record<string, unknown>>) ?? [])) {
          all.push({
            id: `job-${j.id}`,
            type: 'collection',
            title: `Collection ${String(j.status ?? '')}`,
            description: String(j.source ?? ''),
            timestamp: String(j.completedAt ?? j.createdAt ?? ''),
          });
        }

        all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setItems(all);
      })
      .finally(() => setLoading(false));
  }, [currentProject]);

  const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Activity Feed</h1>
        <p className="mt-1 text-sm text-zinc-500">Recent PRs, decisions, and collection jobs</p>
      </div>

      {!currentProject && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-500">
          Select a project to view activity
        </div>
      )}

      {currentProject && (
        <>
          <div className="flex gap-2">
            {(['all', 'pr', 'decision', 'collection'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === key
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
                }`}
              >
                {key === 'all' ? 'All' : TYPE_STYLES[key].label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-zinc-800/50" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-500">
              No activity found. Run <code className="text-zinc-400">vibe sync</code> to collect data.
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.slice(0, 100).map((item) => {
                const style = TYPE_STYLES[item.type];
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 transition-colors hover:bg-zinc-800/30"
                  >
                    <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${style.bg} ${style.text}`}>
                      {style.label}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-zinc-200">{item.title}</p>
                      {item.description && (
                        <p className="truncate text-xs text-zinc-500">{item.description}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-zinc-600">
                      {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : ''}
                    </span>
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
