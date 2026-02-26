'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

const STATUS_CONFIG: Record<string, { cls: string; dot: string }> = {
  PENDING: {
    cls: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
    dot: 'bg-amber-400',
  },
  RUNNING: {
    cls: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
    dot: 'bg-blue-400 animate-pulse',
  },
  COMPLETED: {
    cls: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  FAILED: {
    cls: 'bg-red-500/10 text-red-400 ring-red-500/20',
    dot: 'bg-red-400',
  },
};

export default function CollectionPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [projectId, setProjectId] = useState('');

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

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['collection-jobs', projectId],
    queryFn: () => api.getCollectionJobs(projectId),
    enabled: !!projectId,
    refetchInterval: 5000,
  });

  const collectMutation = useMutation({
    mutationFn: () => api.triggerCollection(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-jobs', projectId] });
      addToast('Data collection triggered successfully', 'success');
    },
    onError: (err) => {
      addToast(err instanceof Error ? err.message : 'Collection failed', 'error');
    },
  });

  const computeMutation = useMutation({
    mutationFn: () => api.triggerCompute(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-jobs', projectId] });
      addToast('Metric computation completed', 'success');
    },
    onError: (err) => {
      addToast(err instanceof Error ? err.message : 'Computation failed', 'error');
    },
  });

  const jobs = jobsData?.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Data Collection</h1>
          <p className="mt-0.5 text-[13px] text-zinc-500">Manage data collection and metric computation</p>
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
          </svg>
          <p className="text-sm text-zinc-500">Select a project to manage collection</p>
        </div>
      ) : (
        <>
          <div className="flex gap-3">
            <Button onClick={() => collectMutation.mutate()} loading={collectMutation.isPending}>
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Trigger Collection
            </Button>
            <Button
              variant="secondary"
              onClick={() => computeMutation.mutate()}
              loading={computeMutation.isPending}
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75V18m15-8.25v-4.5A2.25 2.25 0 0021 3H3a2.25 2.25 0 00-2.25 2.25v4.5m22.5 0a2.25 2.25 0 01-2.25 2.25H3a2.25 2.25 0 01-2.25-2.25m22.5 0v4.5m0 0v4.5a2.25 2.25 0 01-2.25 2.25H3a2.25 2.25 0 01-2.25-2.25v-4.5" />
              </svg>
              Trigger Compute
            </Button>
          </div>

          {collectMutation.error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              Collection error:{' '}
              {collectMutation.error instanceof Error
                ? collectMutation.error.message
                : 'Unknown error'}
            </div>
          )}
          {computeMutation.error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              Compute error:{' '}
              {computeMutation.error instanceof Error
                ? computeMutation.error.message
                : 'Unknown error'}
            </div>
          )}

          <div className="card-base overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
              <h2 className="text-[13px] font-semibold text-zinc-300">Collection Jobs</h2>
              <span className="text-[11px] text-zinc-600">{jobs.length} jobs</span>
            </div>
            {jobsLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-12">
                <svg className="mb-3 h-10 w-10 text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
                </svg>
                <p className="text-sm font-medium text-zinc-400">No collection jobs yet</p>
                <p className="mt-1 text-xs text-zinc-600">Click &quot;Trigger Collection&quot; to start gathering data</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-zinc-800/60">
                      <th className="px-5 py-2.5 text-left font-medium text-zinc-500">Source</th>
                      <th className="px-5 py-2.5 text-left font-medium text-zinc-500">Status</th>
                      <th className="px-5 py-2.5 text-left font-medium text-zinc-500">Items</th>
                      <th className="px-5 py-2.5 text-left font-medium text-zinc-500">Started</th>
                      <th className="px-5 py-2.5 text-left font-medium text-zinc-500">Completed</th>
                      <th className="px-5 py-2.5 text-left font-medium text-zinc-500">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => {
                      const config = STATUS_CONFIG[job.status] ?? {
                        cls: 'bg-zinc-800 text-zinc-400 ring-zinc-700',
                        dot: 'bg-zinc-400',
                      };
                      return (
                        <tr
                          key={job.id}
                          className="border-b border-zinc-800/30 transition-colors hover:bg-zinc-800/20"
                        >
                          <td className="px-5 py-2.5 font-medium text-zinc-300">{job.source}</td>
                          <td className="px-5 py-2.5">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${config.cls}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                              {job.status}
                            </span>
                          </td>
                          <td className="px-5 py-2.5 text-zinc-400">{job.itemsCount}</td>
                          <td className="px-5 py-2.5 text-zinc-500">
                            {job.startedAt ? new Date(job.startedAt).toLocaleString() : '-'}
                          </td>
                          <td className="px-5 py-2.5 text-zinc-500">
                            {job.completedAt ? new Date(job.completedAt).toLocaleString() : '-'}
                          </td>
                          <td className="max-w-[200px] truncate px-5 py-2.5 text-red-400">
                            {job.error ?? '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
