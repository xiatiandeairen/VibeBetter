'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';

export default function PrsPage() {
  const projectId = useAppStore((s) => s.selectedProjectId);
  const setProjectId = useAppStore((s) => s.setSelectedProjectId);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  });

  const projects = useMemo(
    () => projectsData?.data ?? [],
    [projectsData?.data],
  );

  useEffect(() => {
    if (!projectId && projects.length === 1 && projects[0]) {
      setProjectId(projects[0].id);
    }
  }, [projectId, projects, setProjectId]);

  const { data: prsData, isLoading: prsLoading } = useQuery({
    queryKey: ['all-prs', projectId],
    queryFn: () => api.getAllPrs(projectId),
    enabled: !!projectId,
  });

  const prs = prsData?.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">
            Pull Requests
          </h1>
          <p className="mt-0.5 text-[13px] text-zinc-500">
            All PRs for the selected project
          </p>
        </div>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="appearance-none rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-3 pr-8 text-[13px] text-zinc-300 transition-colors focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
        >
          <option value="">Select project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {(projectsLoading || prsLoading) && (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      )}

      {!projectId && !projectsLoading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20">
          <p className="text-sm text-zinc-500">
            Select a project to view pull requests
          </p>
        </div>
      )}

      {projectId && !prsLoading && prs.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20">
          <p className="text-sm text-zinc-500">No pull requests found</p>
        </div>
      )}

      {projectId && prs.length > 0 && (
        <div className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="px-4 py-2.5 text-left font-medium text-zinc-500">
                    #
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-zinc-500">
                    Title
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-zinc-500">
                    Author
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-zinc-500">
                    AI
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-zinc-500">
                    State
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-zinc-500">
                    +/-
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-zinc-500">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {prs.map((pr) => {
                  const isExpanded = expandedId === pr.id;
                  const isRollback = pr.rollbackFlag;
                  return (
                    <Fragment key={pr.id}>
                      <tr
                        onClick={() =>
                          setExpandedId(isExpanded ? null : pr.id)
                        }
                        className={`cursor-pointer border-b border-zinc-800/30 transition-colors hover:bg-zinc-800/20 ${
                          isRollback ? 'bg-red-500/5' : ''
                        }`}
                      >
                        <td className="px-4 py-2.5 text-zinc-500">
                          {pr.number}
                        </td>
                        <td className="max-w-[300px] truncate px-4 py-2.5 text-zinc-300">
                          {pr.title}
                        </td>
                        <td className="px-4 py-2.5 text-zinc-400">
                          {pr.authorLogin}
                        </td>
                        <td className="px-4 py-2.5">
                          {pr.aiUsed && (
                            <span className="inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              pr.state === 'merged'
                                ? 'bg-violet-500/10 text-violet-400'
                                : pr.state === 'closed'
                                  ? 'bg-red-500/10 text-red-400'
                                  : 'bg-emerald-500/10 text-emerald-400'
                            }`}
                          >
                            {pr.state}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="text-emerald-400">
                            +{pr.additions}
                          </span>
                          <span className="mx-1 text-zinc-600">/</span>
                          <span className="text-red-400">
                            -{pr.deletions}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-zinc-500">
                          {new Date(pr.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="border-b border-zinc-800/30 bg-zinc-900/50">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                              <DetailItem
                                label="Commits"
                                value={String(pr.commitCount)}
                              />
                              <DetailItem
                                label="Review Comments"
                                value={String(pr.reviewComments)}
                              />
                              <DetailItem
                                label="Merge Time"
                                value={
                                  pr.mergedAt
                                    ? formatDuration(pr.createdAt, pr.mergedAt)
                                    : 'Not merged'
                                }
                              />
                              <DetailItem
                                label="Rollback"
                                value={pr.rollbackFlag ? 'Yes' : 'No'}
                                highlight={pr.rollbackFlag}
                              />
                              <DetailItem
                                label="Changed Files"
                                value={String(pr.changedFiles)}
                              />
                              <DetailItem
                                label="Major Revision"
                                value={pr.majorRevision ? 'Yes' : 'No'}
                              />
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import { Fragment } from 'react';

function DetailItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">
        {label}
      </p>
      <p
        className={`mt-0.5 text-sm font-semibold ${highlight ? 'text-red-400' : 'text-zinc-200'}`}
      >
        {value}
      </p>
    </div>
  );
}

function formatDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}
