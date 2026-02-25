'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

const LEVEL_STYLES: Record<string, string> = {
  CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/30',
  WARNING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  INFO: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-zinc-700 text-zinc-300',
  ACCEPTED: 'bg-emerald-500/20 text-emerald-400',
  REJECTED: 'bg-zinc-600 text-zinc-400',
};

export default function DecisionsPage() {
  const queryClient = useQueryClient();
  const [projectId, setProjectId] = useState('');

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  });

  const projects = useMemo(() => projectsData?.data ?? [], [projectsData]);

  const selectedId = projectId || (projects.length === 1 ? projects[0]?.id ?? '' : '');

  const { data: decisionsData, isLoading } = useQuery({
    queryKey: ['decisions', selectedId],
    queryFn: () => api.getDecisions(selectedId),
    enabled: !!selectedId,
  });

  const generateMutation = useMutation({
    mutationFn: () => api.generateDecisions(selectedId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions', selectedId] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateDecisionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions', selectedId] });
    },
  });

  const decisions = decisionsData?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Decisions</h1>
          <p className="mt-1 text-sm text-zinc-500">AI-driven engineering recommendations</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedId && (
            <Button onClick={() => generateMutation.mutate()} loading={generateMutation.isPending}>
              Analyze & Generate
            </Button>
          )}
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
      </div>

      {!selectedId ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-zinc-700 py-20">
          <p className="text-zinc-500">Select a project to view decisions</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : decisions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 py-20">
          <p className="text-zinc-500">No decisions yet</p>
          <p className="mt-2 text-sm text-zinc-600">Click &quot;Analyze &amp; Generate&quot; to get recommendations</p>
        </div>
      ) : (
        <div className="space-y-3">
          {decisions.map((d) => (
            <div
              key={d.id}
              className={`rounded-xl border p-5 transition-colors ${LEVEL_STYLES[d.level] ?? 'border-zinc-700 bg-zinc-800/50'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                      {d.level}
                    </span>
                    <span className="text-xs text-zinc-500">{d.category}</span>
                  </div>
                  <h3 className="mt-1 font-semibold text-zinc-100">{d.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{d.description}</p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[d.status] ?? ''}`}>
                    {d.status}
                  </span>
                  {d.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => statusMutation.mutate({ id: d.id, status: 'ACCEPTED' })}
                        className="rounded-lg px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-500/10"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => statusMutation.mutate({ id: d.id, status: 'REJECTED' })}
                        className="rounded-lg px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-700"
                      >
                        Dismiss
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
