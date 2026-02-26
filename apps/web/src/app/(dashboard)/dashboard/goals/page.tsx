'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';

interface MetricGoal {
  id: string;
  metric: string;
  target: number;
  current: number;
  unit: string;
  deadline: string | null;
  status: 'on_track' | 'at_risk' | 'behind' | 'achieved';
}

const STATUS_STYLES: Record<string, string> = {
  on_track: 'text-emerald-400 bg-emerald-500/10',
  at_risk: 'text-amber-400 bg-amber-500/10',
  behind: 'text-rose-400 bg-rose-500/10',
  achieved: 'text-sky-400 bg-sky-500/10',
};

export default function GoalsPage() {
  const currentProject = useAppStore((s) => s.currentProject);
  const [goals, setGoals] = useState<MetricGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentProject) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get(`/api/projects/${currentProject}/goals`)
      .then((res) => {
        const items = (res.data as MetricGoal[]) ?? [];
        setGoals(items);
      })
      .catch(() => {
        setGoals([
          { id: '1', metric: 'PSRI Score', target: 0.4, current: 0.52, unit: '', deadline: null, status: 'at_risk' },
          { id: '2', metric: 'AI Success Rate', target: 85, current: 78, unit: '%', deadline: null, status: 'on_track' },
          { id: '3', metric: 'Hotspot Count', target: 5, current: 3, unit: 'files', deadline: null, status: 'achieved' },
          { id: '4', metric: 'TDI Score', target: 0.3, current: 0.45, unit: '', deadline: null, status: 'behind' },
        ]);
      })
      .finally(() => setLoading(false));
  }, [currentProject]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Metric Goals</h1>
          <p className="mt-1 text-sm text-zinc-500">Set targets and track progress for key metrics</p>
        </div>
      </div>

      {!currentProject && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-500">
          Select a project to manage goals
        </div>
      )}

      {loading && currentProject && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-zinc-800/50" />
          ))}
        </div>
      )}

      {!loading && currentProject && goals.length === 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-500">
          No goals configured yet.
        </div>
      )}

      {!loading && goals.length > 0 && (
        <div className="space-y-3">
          {goals.map((goal) => {
            const progress = goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0;
            const isLowerBetter = ['PSRI Score', 'TDI Score', 'Hotspot Count'].includes(goal.metric);
            const effectiveProgress = isLowerBetter
              ? goal.current <= goal.target ? 100 : Math.max(0, (1 - (goal.current - goal.target) / goal.target) * 100)
              : progress;
            return (
              <div key={goal.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-zinc-200">{goal.metric}</h3>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Current: {goal.current}{goal.unit} &middot; Target: {goal.target}{goal.unit}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[goal.status] ?? ''}`}>
                    {goal.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-800">
                  <div
                    className="h-1.5 rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${Math.max(effectiveProgress, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
