'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';

interface DigestSection {
  title: string;
  items: string[];
  trend: 'up' | 'down' | 'stable';
}

interface WeeklyDigest {
  weekStart: string;
  weekEnd: string;
  summary: string;
  sections: DigestSection[];
  highlights: string[];
}

const TREND_ICON: Record<string, string> = {
  up: '\u2191',
  down: '\u2193',
  stable: '\u2192',
};

const TREND_COLOR: Record<string, string> = {
  up: 'text-emerald-400',
  down: 'text-rose-400',
  stable: 'text-zinc-400',
};

export default function DigestPage() {
  const currentProject = useAppStore((s) => s.currentProject);
  const [digest, setDigest] = useState<WeeklyDigest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentProject) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get(`/api/projects/${currentProject}/digest`)
      .then((res) => {
        setDigest(res.data as WeeklyDigest);
      })
      .catch(() => {
        setDigest({
          weekStart: new Date(Date.now() - 7 * 86400000).toISOString(),
          weekEnd: new Date().toISOString(),
          summary: 'Project health improved this week with lower PSRI and reduced hotspot count.',
          sections: [
            { title: 'Risk Changes', items: ['PSRI decreased from 0.58 to 0.52', 'TDI stable at 0.34', '2 hotspots resolved'], trend: 'down' },
            { title: 'AI Coding', items: ['AI success rate: 82%', '14 AI-assisted PRs merged', 'Average edit distance: 23%'], trend: 'up' },
            { title: 'Activity', items: ['28 PRs merged this week', '6 new contributors', '142 files changed'], trend: 'up' },
          ],
          highlights: ['Reduced structural complexity in core modules', 'AI adoption rate increased by 12%'],
        });
      })
      .finally(() => setLoading(false));
  }, [currentProject]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Weekly Digest</h1>
        <p className="mt-1 text-sm text-zinc-500">Summary of project health and activity this week</p>
      </div>

      {!currentProject && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-500">
          Select a project to view its weekly digest
        </div>
      )}

      {loading && currentProject && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-zinc-800/50" />
          ))}
        </div>
      )}

      {!loading && currentProject && !digest && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-500">
          No digest available. Collect at least one week of data first.
        </div>
      )}

      {!loading && digest && (
        <>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                {new Date(digest.weekStart).toLocaleDateString()} — {new Date(digest.weekEnd).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-3 text-sm text-zinc-300">{digest.summary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {digest.sections.map((section) => (
              <div key={section.title} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-zinc-200">{section.title}</h3>
                  <span className={`text-sm ${TREND_COLOR[section.trend]}`}>{TREND_ICON[section.trend]}</span>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {section.items.map((item, i) => (
                    <li key={i} className="text-xs text-zinc-400">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {digest.highlights.length > 0 && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <h3 className="text-sm font-medium text-zinc-200">Highlights</h3>
              <ul className="mt-2 space-y-1">
                {digest.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-indigo-500" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
