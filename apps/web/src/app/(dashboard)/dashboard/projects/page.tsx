'use client';

import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProjectsPage() {
  const queryClient = useQueryClient();
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projects</h1>
        <Button onClick={() => setShowModal(true)}>New Project</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-20 dark:border-slate-600">
          <p className="text-slate-500 dark:text-slate-400">
            No projects yet. Create your first project.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{project.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                    {project.repoUrl}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    project.isActive
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  }`}
                >
                  {project.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {project.description && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {project.description}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">
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
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
              Create Project
            </h2>
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
                <p className="text-sm text-red-500">
                  {createMutation.error instanceof Error
                    ? createMutation.error.message
                    : 'Failed to create project'}
                </p>
              )}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                >
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
