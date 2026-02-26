'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { MetricsOverviewResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getBenchmarkLevel } from '@vibebetter/shared';

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { num: 1, label: 'Connect Repository' },
  { num: 2, label: 'Collecting Data' },
  { num: 3, label: 'Computing Insights' },
  { num: 4, label: 'Your AI Coding Report' },
];

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                s.num < current
                  ? 'bg-indigo-500 text-white'
                  : s.num === current
                    ? 'bg-indigo-500/20 text-indigo-400 ring-2 ring-indigo-500'
                    : 'bg-zinc-800 text-zinc-600'
              }`}
            >
              {s.num < current ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                s.num
              )}
            </div>
            <span
              className={`mt-2 text-[11px] font-medium ${
                s.num <= current ? 'text-zinc-300' : 'text-zinc-600'
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`mx-3 mb-6 h-0.5 w-16 rounded transition-colors duration-300 ${
                s.num < current ? 'bg-indigo-500' : 'bg-zinc-800'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function BenchmarkBadge({ metric, value }: { metric: 'aiSuccessRate' | 'psriScore' | 'tdiScore' | 'aiStableRate'; value: number | null }) {
  if (value === null) return <span className="text-xs text-zinc-600">N/A</span>;
  const level = getBenchmarkLevel(metric as 'aiSuccessRate' | 'psriScore', value);
  const colors: Record<string, string> = {
    Excellent: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    Good: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
    Average: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
    Poor: 'bg-red-500/10 text-red-400 ring-red-500/20',
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${colors[level] ?? ''}`}>
      {level}
    </span>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [projectId, setProjectId] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dots, setDots] = useState('');
  const [metrics, setMetrics] = useState<MetricsOverviewResponse['data'] | null>(null);

  useEffect(() => {
    if (step === 2 || step === 3) {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [step]);

  const pollJobs = useCallback(async (pid: string) => {
    const poll = async () => {
      try {
        const res = await api.getCollectionJobs(pid);
        const jobs = res.data ?? [];
        const completed = jobs.some((j) => j.status === 'COMPLETED');
        const failed = jobs.every((j) => j.status === 'FAILED');
        if (completed) {
          setStep(3);
          return;
        }
        if (failed && jobs.length > 0) {
          setStep(3);
          return;
        }
        setTimeout(poll, 3000);
      } catch {
        setTimeout(poll, 3000);
      }
    };
    poll();
  }, []);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const name = repoUrl.split('/').filter(Boolean).pop() ?? 'project';
      const res = await api.createProject({ name, repoUrl });
      const pid = res.data.id;
      setProjectId(pid);
      setStep(2);
      pollJobs(pid);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import project');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (step === 3 && projectId) {
      let cancelled = false;
      (async () => {
        try {
          await api.triggerCompute(projectId);
          if (!cancelled) {
            const metricsRes = await api.getMetricsOverview(projectId);
            setMetrics(metricsRes.data);
            setStep(4);
          }
        } catch {
          if (!cancelled) {
            try {
              const metricsRes = await api.getMetricsOverview(projectId);
              setMetrics(metricsRes.data);
            } catch { /* empty */ }
            setStep(4);
          }
        }
      })();
      return () => { cancelled = true; };
    }
  }, [step, projectId]);

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-fade-in py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-100">Set Up Your Project</h1>
        <p className="mt-1 text-sm text-zinc-500">Import a GitHub repository and get your first AI coding report</p>
      </div>

      <StepIndicator current={step} />

      <div className="card-base p-8">
        {step === 1 && (
          <form onSubmit={handleImport} className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10">
                <svg className="h-7 w-7 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-zinc-100">Connect Repository</h2>
              <p className="mt-1 text-sm text-zinc-500">Enter the GitHub URL of the repository you want to analyze</p>
            </div>
            <Input
              label="GitHub Repository URL"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/org/repo"
              required
            />
            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>
            )}
            <Button type="submit" loading={loading} className="w-full">
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Import Project
            </Button>
          </form>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center py-8">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-100">Collecting Data{dots}</h2>
            <p className="mt-2 text-sm text-zinc-500">Fetching pull requests, commits, and file metrics from your repository</p>
            <div className="mt-6 w-full max-w-xs">
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full animate-pulse rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center py-8">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-100">Computing Insights{dots}</h2>
            <p className="mt-2 text-sm text-zinc-500">Calculating AI success rate, PSRI, TDI, and risk metrics</p>
            <div className="mt-6 w-full max-w-xs">
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full animate-pulse rounded-full bg-gradient-to-r from-violet-500 to-purple-500" style={{ width: '80%' }} />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
                <svg className="h-7 w-7 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-zinc-100">Your AI Coding Report</h2>
              <p className="mt-1 text-sm text-zinc-500">Here&apos;s a summary of your project&apos;s AI coding health</p>
            </div>

            {metrics && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-500">AI Success Rate</span>
                      <BenchmarkBadge metric="aiSuccessRate" value={metrics.aiSuccessRate} />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-zinc-100">
                      {metrics.aiSuccessRate !== null ? `${(metrics.aiSuccessRate * 100).toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-500">PSRI Score</span>
                      <BenchmarkBadge metric="psriScore" value={metrics.psriScore} />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-zinc-100">
                      {metrics.psriScore !== null ? metrics.psriScore.toFixed(3) : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <p className="text-sm leading-relaxed text-zinc-400">
                    Your project has <span className="font-semibold text-zinc-200">{metrics.totalPrs} PRs</span>,{' '}
                    <span className="font-semibold text-indigo-400">{metrics.aiPrs} are AI-assisted</span>.{' '}
                    {metrics.totalFiles > 0 && (
                      <>
                        Across <span className="font-semibold text-zinc-200">{metrics.totalFiles} files</span>,{' '}
                        <span className="font-semibold text-amber-400">{metrics.hotspotFiles} hotspot files</span> were identified.
                      </>
                    )}
                  </p>
                </div>
              </>
            )}

            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Go to Dashboard
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
