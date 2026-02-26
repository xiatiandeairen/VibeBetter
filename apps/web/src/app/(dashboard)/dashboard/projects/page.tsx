'use client';

import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [description, setDescription] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  });

  const createMutation = useMutation({
    mutationFn: (input: { name: string; repoUrl: string; description?: string }) =>
      api.createProject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowModal(false);
      setName('');
      setRepoUrl('');
      setDescription('');
      addToast('Project created! First data collection started.', 'success');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    createMutation.mutate({ name, repoUrl, description: description || undefined });
  }

  const projects = data?.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Projects</h1>
          <p className="mt-0.5 text-[13px] text-zinc-500">Manage your repositories</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/onboarding">
            <Button variant="secondary">
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Import from GitHub
            </Button>
          </Link>
          <Button onClick={() => setShowModal(true)}>
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Project
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20">
          <svg className="mb-3 h-8 w-8 text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          <p className="text-sm text-zinc-500">No projects yet. Create your first project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="card-interactive group p-5"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                      </svg>
                    </div>
                    <h3 className="truncate text-sm font-semibold text-zinc-100">{project.name}</h3>
                  </div>
                  <p className="mt-2 truncate text-xs text-zinc-600 font-mono">{project.repoUrl}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    project.isActive
                      ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20'
                      : 'bg-zinc-800 text-zinc-500 ring-1 ring-inset ring-zinc-700'
                  }`}
                >
                  {project.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {project.description && (
                <p className="mt-3 text-[13px] leading-relaxed text-zinc-500">{project.description}</p>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-zinc-800/50 pt-3">
                <span className="text-[11px] text-zinc-600">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
                <Button
                  variant="danger"
                  size="sm"
                  loading={deleteMutation.isPending}
                  onClick={() => {
                    if (confirm('Delete this project?')) {
                      deleteMutation.mutate(project.id);
                    }
                  }}
                >
                  <svg className="mr-1 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md glass-strong rounded-2xl p-6 glow-sm animate-fade-in">
            <h2 className="mb-1 text-lg font-semibold text-zinc-100">Create Project</h2>
            <p className="mb-5 text-[13px] text-zinc-500">Add a new repository to track</p>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Project Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="My Project"
              />
              <Input
                label="Repository URL"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                required
                placeholder="https://github.com/org/repo"
              />
              <Input
                label="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description"
              />
              {createMutation.error && (
                <p className="text-sm text-red-400">
                  {createMutation.error instanceof Error
                    ? createMutation.error.message
                    : 'Failed to create project'}
                </p>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={createMutation.isPending}>
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
