'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { WeightConfigData } from '@/lib/api';
import { Button } from '@/components/ui/button';

const WEIGHT_KEYS: Array<{ key: keyof WeightConfigData; label: string }> = [
  { key: 'structural', label: 'Structural' },
  { key: 'change', label: 'Change' },
  { key: 'defect', label: 'Defect' },
  { key: 'architecture', label: 'Architecture' },
  { key: 'runtime', label: 'Runtime' },
  { key: 'coverage', label: 'Coverage' },
];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [projectId, setProjectId] = useState('');
  const [weights, setWeights] = useState<WeightConfigData>({
    structural: 0.3,
    change: 0.25,
    defect: 0.2,
    architecture: 0.1,
    runtime: 0.05,
    coverage: 0.1,
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  });

  const projects = useMemo(() => projectsData?.data ?? [], [projectsData?.data]);

  useEffect(() => {
    if (!projectId && projects.length === 1 && projects[0]) {
      setProjectId(projects[0].id);
    }
  }, [projectId, projects]);

  const { data: weightsData, isLoading: weightsLoading } = useQuery({
    queryKey: ['weights', projectId],
    queryFn: () => api.getWeights(projectId),
    enabled: !!projectId,
  });

  useEffect(() => {
    if (weightsData?.data) {
      setWeights(weightsData.data);
    }
  }, [weightsData]);

  const saveMutation = useMutation({
    mutationFn: () => api.updateWeights(projectId, weights),
    onSuccess: async () => {
      setFeedback({ type: 'success', message: 'Weights saved successfully. Recomputing metrics...' });
      queryClient.invalidateQueries({ queryKey: ['weights', projectId] });
      try {
        await api.triggerCompute(projectId);
        queryClient.invalidateQueries({ queryKey: ['metrics-overview', projectId] });
        queryClient.invalidateQueries({ queryKey: ['metric-snapshots', projectId] });
        setFeedback({ type: 'success', message: 'Weights saved and metrics recomputed.' });
      } catch {
        setFeedback({ type: 'error', message: 'Weights saved but metric recompute failed.' });
      }
    },
    onError: (err) => {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save weights' });
    },
  });

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  function handleSliderChange(key: keyof WeightConfigData, value: number) {
    setWeights((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Settings</h1>
          <p className="mt-0.5 text-[13px] text-zinc-500">Configure PSRI weight parameters</p>
        </div>
        <div className="relative">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="appearance-none rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-8 text-[13px] text-zinc-300 transition-colors focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
          >
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!projectId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20">
          <svg className="mb-3 h-8 w-8 text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm text-zinc-500">Select a project to configure weights</p>
        </div>
      ) : weightsLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : (
        <div className="card-base p-6">
          <h2 className="mb-6 text-sm font-semibold text-zinc-300">PSRI Dimension Weights</h2>
          <div className="space-y-5">
            {WEIGHT_KEYS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-4">
                <span className="w-28 text-[13px] font-medium text-zinc-400">{label}</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={weights[key]}
                  onChange={(e) => handleSliderChange(key, parseFloat(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-700 accent-indigo-500 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500"
                />
                <span className="w-12 text-right font-mono text-[13px] text-zinc-300">{weights[key].toFixed(2)}</span>
              </div>
            ))}
          </div>

          {feedback && (
            <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-red-500/30 bg-red-500/10 text-red-400'
            }`}>
              {feedback.message}
            </div>
          )}

          <div className="mt-6">
            <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
              Save Weights
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
