'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';

interface ChangeEntry {
  id: string;
  title: string;
  author: string;
  date: string;
  type: 'feature' | 'fix' | 'refactor' | 'docs';
  description: string;
}

const TYPE_COLORS: Record<string, string> = {
  feature: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  fix: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  refactor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  docs: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
};

export default function ChangelogPage() {
  const currentProject = useAppStore((s) => s.currentProject);
  const [entries, setEntries] = useState<ChangeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentProject) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get(`/api/projects/${currentProject}/prs?limit=30`)
      .then((res) => {
        const prs = (res.data as Array<Record<string, unknown>>) ?? [];
        const mapped: ChangeEntry[] = prs.map((pr, i) => ({
          id: String(pr.id ?? i),
          title: String(pr.title ?? 'Untitled'),
          author: String(pr.author ?? 'unknown'),
          date: String(pr.mergedAt ?? pr.createdAt ?? new Date().toISOString()),
          type: detectType(String(pr.title ?? '')),
          description: String(pr.body ?? '').slice(0, 200),
        }));
        setEntries(mapped);
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [currentProject]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Changelog</h1>
        <p className="mt-1 text-sm text-zinc-500">Recent changes and pull request history</p>
      </div>

      {!currentProject && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-500">
          Select a project to view its changelog
        </div>
      )}

      {loading && currentProject && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-zinc-800/50" />
          ))}
        </div>
      )}

      {!loading && currentProject && entries.length === 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-500">
          No changes found. Run <code className="text-zinc-400">vibe sync</code> to collect data.
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div className="relative space-y-0">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-zinc-800" />
          {entries.map((entry) => (
            <div key={entry.id} className="relative flex gap-4 py-3">
              <div className="relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500 ring-4 ring-[#09090b]" />
              <div className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-zinc-200">{entry.title}</h3>
                    {entry.description && (
                      <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{entry.description}</p>
                    )}
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${TYPE_COLORS[entry.type] ?? TYPE_COLORS.feature}`}>
                    {entry.type}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-600">
                  <span>{entry.author}</span>
                  <span>&middot;</span>
                  <span>{new Date(entry.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function detectType(title: string): ChangeEntry['type'] {
  const lower = title.toLowerCase();
  if (lower.startsWith('fix') || lower.includes('bug')) return 'fix';
  if (lower.startsWith('refactor') || lower.includes('refactor')) return 'refactor';
  if (lower.startsWith('doc') || lower.includes('readme')) return 'docs';
  return 'feature';
}
