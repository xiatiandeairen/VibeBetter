'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { MetricCard } from '@/components/ui/metric-card';
import { toPercent } from '@vibebetter/shared';

export default function InsightsPage() {
  const [projectId, setProjectId] = useState('');

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  });

  const projects = useMemo(() => projectsData?.data ?? [], [projectsData]);
  const selectedId = projectId || (projects.length === 1 ? projects[0]?.id ?? '' : '');

  const { data: aiData, isLoading: aiLoading } = useQuery({
    queryKey: ['ai-stats', selectedId],
    queryFn: () => api.getAiBehaviorStats(selectedId),
    enabled: !!selectedId,
  });

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user-stats', selectedId],
    queryFn: () => api.getUserBehaviorStats(selectedId),
    enabled: !!selectedId,
  });

  const ai = aiData?.data;
  const user = userData?.data;
  const loading = aiLoading || userLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">AI Insights</h1>
          <p className="mt-1 text-sm text-zinc-500">AI tool effectiveness and developer behavior</p>
        </div>
        <select
          value={selectedId}
          onChange={(e) => setProjectId(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300"
        >
          <option value="">Select project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {!selectedId ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-zinc-700 py-20">
          <p className="text-zinc-500">Select a project to view AI insights</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : (
        <>
          <div>
            <h2 className="mb-3 text-lg font-semibold text-zinc-200">AI Tool Effectiveness</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="AI ACCEPTANCE RATE"
                value={ai ? toPercent(ai.acceptanceRate) : 'N/A'}
                subtitle="Generated code accepted by developers"
                color="green"
              />
              <MetricCard
                title="TOTAL GENERATIONS"
                value={String(ai?.totalGenerations ?? 0)}
                subtitle={`${ai?.totalAccepted ?? 0} accepted`}
                color="blue"
              />
              <MetricCard
                title="AVG EDIT DISTANCE"
                value={ai?.avgEditDistance != null ? ai.avgEditDistance.toFixed(2) : 'N/A'}
                subtitle="How much devs modify AI output"
                color="amber"
              />
              <MetricCard
                title="TOOLS TRACKED"
                value={String(Object.keys(ai?.toolUsage ?? {}).length)}
                subtitle="Distinct AI coding tools"
                color="indigo"
              />
            </div>
          </div>

          {ai && Object.keys(ai.toolUsage).length > 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Tool Usage Breakdown
              </h3>
              <div className="space-y-2">
                {Object.entries(ai.toolUsage).map(([tool, count]) => {
                  const total = Object.values(ai.toolUsage).reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={tool} className="flex items-center gap-3">
                      <span className="w-24 text-sm font-medium text-zinc-300 capitalize">{tool}</span>
                      <div className="flex-1">
                        <div className="h-2 rounded-full bg-zinc-800">
                          <div
                            className="h-2 rounded-full bg-indigo-500 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-16 text-right text-sm text-zinc-500">{count} events</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">Effectiveness Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-zinc-800 p-4">
                <p className="text-[11px] font-medium uppercase text-zinc-600">Acceptance Rate</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-3xl font-bold text-emerald-400">{ai ? (ai.acceptanceRate * 100).toFixed(0) : 0}%</span>
                  <span className="mb-1 text-xs text-zinc-600">of AI suggestions accepted</span>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-zinc-800">
                  <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${(ai?.acceptanceRate ?? 0) * 100}%` }} />
                </div>
              </div>
              <div className="rounded-lg border border-zinc-800 p-4">
                <p className="text-[11px] font-medium uppercase text-zinc-600">Avg Edit Distance</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-3xl font-bold text-amber-400">{ai?.avgEditDistance?.toFixed(2) ?? 'N/A'}</span>
                  <span className="mb-1 text-xs text-zinc-600">modification after accept</span>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-zinc-800">
                  <div className="h-2 rounded-full bg-amber-500 transition-all" style={{ width: `${Math.min((ai?.avgEditDistance ?? 0) * 200, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-zinc-200">Developer Activity</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="TOTAL EVENTS"
                value={String(user?.totalEvents ?? 0)}
                subtitle="Developer activity events tracked"
                color="blue"
              />
              <MetricCard
                title="UNIQUE FILES"
                value={String(user?.uniqueFiles ?? 0)}
                subtitle="Files touched in tracked sessions"
                color="green"
              />
              <MetricCard
                title="AVG SESSION"
                value={
                  user?.avgSessionDuration
                    ? `${Math.round(user.avgSessionDuration / 60)}m`
                    : 'N/A'
                }
                subtitle="Average coding session duration"
                color="amber"
              />
              <MetricCard
                title="EVENT TYPES"
                value={String(Object.keys(user?.eventTypes ?? {}).length)}
                subtitle="Distinct behavior categories"
                color="indigo"
              />
            </div>
          </div>

          {user && Object.keys(user.eventTypes).length > 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Event Type Distribution
              </h3>
              <div className="space-y-2">
                {Object.entries(user.eventTypes).map(([type, count]) => {
                  const total = Object.values(user.eventTypes).reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <span className="w-24 text-sm font-medium text-zinc-300">{type}</span>
                      <div className="flex-1">
                        <div className="h-2 rounded-full bg-zinc-800">
                          <div
                            className="h-2 rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-16 text-right text-sm text-zinc-500">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
