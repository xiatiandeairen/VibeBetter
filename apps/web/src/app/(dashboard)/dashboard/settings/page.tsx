'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { WeightConfigData } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const WEIGHT_KEYS: Array<{ key: keyof WeightConfigData; label: string }> = [
  { key: 'structural', label: 'Structural' },
  { key: 'change', label: 'Change' },
  { key: 'defect', label: 'Defect' },
  { key: 'architecture', label: 'Architecture' },
  { key: 'runtime', label: 'Runtime' },
  { key: 'coverage', label: 'Coverage' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  const [newKeyName, setNewKeyName] = useState('');
  const [revealedKey, setRevealedKey] = useState('');
  const [webhookCopied, setWebhookCopied] = useState(false);

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

  // API Keys
  const { data: apiKeysData, isLoading: apiKeysLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => api.getApiKeys(),
  });

  const apiKeys = apiKeysData?.data ?? [];

  const createKeyMutation = useMutation({
    mutationFn: (name: string) => api.createApiKey(name),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setRevealedKey(res.data.key);
      setNewKeyName('');
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: (id: string) => api.deleteApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  const webhookUrl = `${API_URL}/api/v1/webhooks/github`;

  function handleCopyWebhook() {
    navigator.clipboard.writeText(webhookUrl).then(() => {
      setWebhookCopied(true);
      setTimeout(() => setWebhookCopied(false), 2000);
    });
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

      {/* API Keys Section */}
      <div className="card-base p-6">
        <h2 className="mb-1 text-sm font-semibold text-zinc-300">API Keys</h2>
        <p className="mb-5 text-[13px] text-zinc-500">Manage API keys for programmatic access</p>

        <div className="flex items-end gap-3 mb-5">
          <Input
            label="Key Name"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="My CI/CD key"
            className="max-w-xs"
          />
          <Button
            onClick={() => createKeyMutation.mutate(newKeyName || 'Untitled Key')}
            loading={createKeyMutation.isPending}
            size="md"
          >
            Create Key
          </Button>
        </div>

        {revealedKey && (
          <div className="mb-5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <p className="mb-1 text-xs font-medium text-amber-400">Copy your API key now — it won&apos;t be shown again</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all rounded bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-200">{revealedKey}</code>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(revealedKey);
                  setRevealedKey('');
                }}
              >
                Copy &amp; Dismiss
              </Button>
            </div>
          </div>
        )}

        {apiKeysLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : apiKeys.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-600">No API keys yet</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-left">
                  <th className="px-4 py-2.5 text-xs font-medium text-zinc-500">Name</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-zinc-500">Prefix</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-zinc-500">Last Used</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-zinc-500">Created</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-zinc-500"></th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((k) => (
                  <tr key={k.id} className="border-b border-zinc-800/50 last:border-0">
                    <td className="px-4 py-2.5 text-[13px] text-zinc-300">{k.name}</td>
                    <td className="px-4 py-2.5 font-mono text-[13px] text-zinc-500">{k.prefix}...</td>
                    <td className="px-4 py-2.5 text-[13px] text-zinc-500">
                      {k.lastUsed ? new Date(k.lastUsed).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-2.5 text-[13px] text-zinc-500">
                      {new Date(k.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Button
                        variant="danger"
                        size="sm"
                        loading={deleteKeyMutation.isPending}
                        onClick={() => {
                          if (confirm('Revoke this API key?')) {
                            deleteKeyMutation.mutate(k.id);
                          }
                        }}
                      >
                        Revoke
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Webhook Configuration Section */}
      <div className="card-base p-6">
        <h2 className="mb-1 text-sm font-semibold text-zinc-300">Webhook Configuration</h2>
        <p className="mb-5 text-[13px] text-zinc-500">Configure GitHub webhooks to receive real-time updates</p>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-zinc-400">Webhook URL</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 font-mono text-[13px] text-zinc-300">
                {webhookUrl}
              </code>
              <Button
                variant="secondary"
                size="md"
                onClick={handleCopyWebhook}
              >
                {webhookCopied ? (
                  <>
                    <svg className="mr-1.5 h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                    Copy URL
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
            <h3 className="mb-2 text-xs font-semibold text-zinc-400">Instructions</h3>
            <p className="text-[13px] leading-relaxed text-zinc-500">
              Add this URL as a webhook in your GitHub repository settings
              (Settings → Webhooks → Add webhook). Set the content type to{' '}
              <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[12px] text-zinc-400">application/json</code>.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold text-zinc-400">Supported Events</h3>
            <div className="flex gap-2">
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-[12px] font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                pull_request
              </span>
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-[12px] font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                push
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
