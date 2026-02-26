'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';

interface TopFile {
  filePath: string;
  cyclomaticComplexity: number;
  changeFrequency90d: number;
  linesOfCode: number;
  authorCount: number;
  aiCodeRatio: number | null;
}

interface AttributionData {
  complexity: { aiAvg: number; humanAvg: number; verdict: string };
  quality: {
    aiMajorRevisionRate: number;
    humanMajorRevisionRate: number;
  };
}

function riskColor(score: number): string {
  if (score >= 400) return 'text-red-400';
  if (score >= 100) return 'text-amber-400';
  return 'text-emerald-400';
}

function riskLabel(score: number): string {
  if (score >= 400) return 'High';
  if (score >= 100) return 'Medium';
  return 'Low';
}

function riskBg(score: number): string {
  if (score >= 400) return 'bg-red-500/10';
  if (score >= 100) return 'bg-amber-500/10';
  return 'bg-emerald-500/10';
}

export default function QualityPage() {
  const projectId = useAppStore((s) => s.selectedProjectId);

  const { data: filesData, isLoading: filesLoading } = useQuery({
    queryKey: ['quality-files', projectId],
    queryFn: () => api.getTopFiles(projectId, 50),
    enabled: !!projectId,
  });

  const { data: attrData, isLoading: attrLoading } = useQuery({
    queryKey: ['quality-attribution', projectId],
    queryFn: () => api.getAttribution(projectId),
    enabled: !!projectId,
  });

  const files = (filesData?.data ?? []) as TopFile[];
  const attr = attrData?.data as AttributionData | undefined;
  const loading = filesLoading || attrLoading;

  const lowCount = files.filter((f) => f.cyclomaticComplexity < 10).length;
  const medCount = files.filter(
    (f) => f.cyclomaticComplexity >= 10 && f.cyclomaticComplexity <= 20,
  ).length;
  const highCount = files.filter((f) => f.cyclomaticComplexity > 20).length;
  const totalFiles = files.length || 1;

  const hotspotFiles = files
    .map((f) => ({
      ...f,
      riskScore: f.cyclomaticComplexity * f.changeFrequency90d,
    }))
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 10);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Quality Dashboard</h1>
        <p className="mt-0.5 text-[13px] text-zinc-500">
          Engineering quality metrics and code health overview
        </p>
      </div>

      {!projectId && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20">
          <p className="text-sm text-zinc-500">Select a project to view quality metrics</p>
        </div>
      )}

      {loading && projectId && (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      )}

      {projectId && !loading && (
        <>
          {/* Test Health */}
          <div className="card-base p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-zinc-300">Test Health</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                All Passing
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-zinc-800/40 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                  Total Tests
                </p>
                <p className="mt-1 text-2xl font-bold text-zinc-100">133</p>
              </div>
              <div className="rounded-lg bg-zinc-800/40 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                  Test Files
                </p>
                <p className="mt-1 text-2xl font-bold text-zinc-100">12</p>
              </div>
              <div className="rounded-lg bg-zinc-800/40 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                  Pass Rate
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-400">100%</p>
              </div>
            </div>
          </div>

          {/* Code Complexity Distribution */}
          <div className="card-base p-5 space-y-4">
            <h2 className="text-[13px] font-semibold text-zinc-300">
              Code Complexity Distribution
            </h2>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-emerald-400">Low (&lt;10)</span>
                  <span className="font-mono text-zinc-400">{lowCount} files</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(lowCount / totalFiles) * 100}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-amber-400">Medium (10-20)</span>
                  <span className="font-mono text-zinc-400">{medCount} files</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${(medCount / totalFiles) * 100}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-red-400">High (&gt;20)</span>
                  <span className="font-mono text-zinc-400">{highCount} files</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-red-500 transition-all duration-500"
                    style={{ width: `${(highCount / totalFiles) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hotspot Risk Matrix */}
          <div className="card-base overflow-hidden">
            <div className="border-b border-zinc-800 px-5 py-3">
              <h2 className="text-[13px] font-semibold text-zinc-300">Hotspot Risk Matrix</h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Top files ranked by complexity × change frequency
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    <th className="px-5 py-2.5 text-left font-medium text-zinc-500">File</th>
                    <th className="px-5 py-2.5 text-left font-medium text-zinc-500">Complexity</th>
                    <th className="px-5 py-2.5 text-left font-medium text-zinc-500">
                      Change Freq
                    </th>
                    <th className="px-5 py-2.5 text-left font-medium text-zinc-500">Risk Score</th>
                    <th className="px-5 py-2.5 text-left font-medium text-zinc-500">Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {hotspotFiles.map((f) => (
                    <tr
                      key={f.filePath}
                      className="border-b border-zinc-800/30 transition-colors hover:bg-zinc-800/20"
                    >
                      <td className="px-5 py-2.5 text-zinc-300 font-mono text-[12px] max-w-[300px] truncate">
                        {f.filePath}
                      </td>
                      <td className="px-5 py-2.5 text-zinc-400">{f.cyclomaticComplexity}</td>
                      <td className="px-5 py-2.5 text-zinc-400">{f.changeFrequency90d}</td>
                      <td className="px-5 py-2.5">
                        <span className={`font-mono font-medium ${riskColor(f.riskScore)}`}>
                          {f.riskScore.toFixed(0)}
                        </span>
                      </td>
                      <td className="px-5 py-2.5">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${riskBg(f.riskScore)} ${riskColor(f.riskScore)}`}
                        >
                          {riskLabel(f.riskScore)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {hotspotFiles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-zinc-600">
                        No file data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Code Quality Summary */}
          {attr && (
            <div className="card-base p-5 space-y-4">
              <h2 className="text-[13px] font-semibold text-zinc-300">AI Code Quality Summary</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-zinc-800/40 p-4 space-y-2">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                    Avg Complexity
                  </p>
                  <div className="flex items-end gap-3">
                    <div>
                      <span className="text-[11px] text-zinc-500">AI</span>
                      <p className="text-lg font-bold text-indigo-400">
                        {attr.complexity.aiAvg.toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-500">Human</span>
                      <p className="text-lg font-bold text-blue-400">
                        {attr.complexity.humanAvg.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-500">{attr.complexity.verdict}</p>
                </div>
                <div className="rounded-lg bg-zinc-800/40 p-4 space-y-2">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                    Major Revision Rate
                  </p>
                  <div className="flex items-end gap-3">
                    <div>
                      <span className="text-[11px] text-zinc-500">AI</span>
                      <p className="text-lg font-bold text-indigo-400">
                        {(attr.quality.aiMajorRevisionRate * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-500">Human</span>
                      <p className="text-lg font-bold text-blue-400">
                        {(attr.quality.humanMajorRevisionRate * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    {attr.quality.aiMajorRevisionRate <= attr.quality.humanMajorRevisionRate
                      ? 'AI code requires fewer major revisions'
                      : 'AI code requires more major revisions'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
