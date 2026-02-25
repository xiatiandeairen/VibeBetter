'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  RUNNING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function CollectionPage() {
  const queryClient = useQueryClient();
  const [projectId, setProjectId] = useState('');

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  });

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
    },
  });

  const computeMutation = useMutation({
    mutationFn: () => api.triggerCompute(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-jobs', projectId] });
    },
  });

  const projects = projectsData?.data ?? [];
  const jobs = jobsData?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Data Collection</h1>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="">Select a project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {!projectId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-20 dark:border-slate-600">
          <p className="text-slate-500 dark:text-slate-400">
            Select a project to manage collection
          </p>
        </div>
      ) : (
        <>
          <div className="flex gap-3">
            <Button onClick={() => collectMutation.mutate()} loading={collectMutation.isPending}>
              Trigger Collection
            </Button>
            <Button
              variant="secondary"
              onClick={() => computeMutation.mutate()}
              loading={computeMutation.isPending}
            >
              Trigger Compute
            </Button>
          </div>

          {collectMutation.error && (
            <p className="text-sm text-red-500">
              Collection error:{' '}
              {collectMutation.error instanceof Error
                ? collectMutation.error.message
                : 'Unknown error'}
            </p>
          )}
          {computeMutation.error && (
            <p className="text-sm text-red-500">
              Compute error:{' '}
              {computeMutation.error instanceof Error
                ? computeMutation.error.message
                : 'Unknown error'}
            </p>
          )}

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h2 className="font-semibold text-slate-900 dark:text-white">Collection Jobs</h2>
            </div>
            {jobsLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-slate-500">
                No collection jobs yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                      <th className="px-6 py-3 font-medium text-slate-500 dark:text-slate-400">
                        Source
                      </th>
                      <th className="px-6 py-3 font-medium text-slate-500 dark:text-slate-400">
                        Status
                      </th>
                      <th className="px-6 py-3 font-medium text-slate-500 dark:text-slate-400">
                        Items
                      </th>
                      <th className="px-6 py-3 font-medium text-slate-500 dark:text-slate-400">
                        Started
                      </th>
                      <th className="px-6 py-3 font-medium text-slate-500 dark:text-slate-400">
                        Completed
                      </th>
                      <th className="px-6 py-3 font-medium text-slate-500 dark:text-slate-400">
                        Error
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr
                        key={job.id}
                        className="border-b border-slate-100 last:border-0 dark:border-slate-700/50"
                      >
                        <td className="px-6 py-3 font-medium text-slate-700 dark:text-slate-300">
                          {job.source}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[job.status] ?? 'bg-slate-100 text-slate-600'}`}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-slate-600 dark:text-slate-400">
                          {job.itemsCount}
                        </td>
                        <td className="px-6 py-3 text-slate-600 dark:text-slate-400">
                          {job.startedAt ? new Date(job.startedAt).toLocaleString() : '-'}
                        </td>
                        <td className="px-6 py-3 text-slate-600 dark:text-slate-400">
                          {job.completedAt ? new Date(job.completedAt).toLocaleString() : '-'}
                        </td>
                        <td className="max-w-[200px] truncate px-6 py-3 text-red-500">
                          {job.error ?? '-'}
                        </td>
                      </tr>
                    ))}
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
