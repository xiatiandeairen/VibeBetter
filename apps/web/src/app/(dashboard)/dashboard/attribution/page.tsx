'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';

interface AttributionData {
  summary: { aiFileCount: number; humanFileCount: number; aiPrCount: number; humanPrCount: number };
  complexity: { aiAvg: number; humanAvg: number; verdict: string };
  stability: { aiChangeFreq: number; humanChangeFreq: number; verdict: string };
  quality: {
    aiMajorRevisionRate: number;
    humanMajorRevisionRate: number;
    aiRollbackRate: number;
    humanRollbackRate: number;
  };
}

interface FailedPrData {
  totalFailed: number;
  majorRevisions: { count: number; aiCount: number };
  rollbacks: { count: number; aiCount: number };
  highReviewRounds: { count: number; aiCount: number };
}

function ComparisonBar({
  label,
  aiValue,
  humanValue,
  verdict,
  lowerIsBetter,
}: {
  label: string;
  aiValue: number;
  humanValue: number;
  verdict: string;
  lowerIsBetter: boolean;
}) {
  const maxVal = Math.max(aiValue, humanValue, 0.001);
  const aiWidth = (aiValue / maxVal) * 100;
  const humanWidth = (humanValue / maxVal) * 100;
  const aiIsGood = lowerIsBetter ? aiValue <= humanValue : aiValue >= humanValue;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-zinc-300">{label}</span>
        <span className="text-[11px] text-zinc-500">{verdict}</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <span className="w-14 text-[11px] text-zinc-500">AI</span>
          <div className="flex-1 overflow-hidden rounded-full bg-zinc-800 h-2.5">
            <div
              className={`h-full rounded-full transition-all ${aiIsGood ? 'bg-emerald-500' : 'bg-red-400'}`}
              style={{ width: `${aiWidth}%` }}
            />
          </div>
          <span className="w-12 text-right text-[12px] font-mono text-zinc-400">{aiValue}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-14 text-[11px] text-zinc-500">Human</span>
          <div className="flex-1 overflow-hidden rounded-full bg-zinc-800 h-2.5">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${humanWidth}%` }}
            />
          </div>
          <span className="w-12 text-right text-[12px] font-mono text-zinc-400">{humanValue}</span>
        </div>
      </div>
    </div>
  );
}

export default function AttributionPage() {
  const projectId = useAppStore((s) => s.selectedProjectId);

  const { data: attrData, isLoading: attrLoading } = useQuery({
    queryKey: ['attribution', projectId],
    queryFn: () => api.getAttribution(projectId),
    enabled: !!projectId,
  });

  const { data: failedData, isLoading: failedLoading } = useQuery({
    queryKey: ['failed-prs', projectId],
    queryFn: () => api.getFailedPrs(projectId),
    enabled: !!projectId,
  });

  const attr = attrData?.data as AttributionData | undefined;
  const failed = failedData?.data as FailedPrData | undefined;
  const loading = attrLoading || failedLoading;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">AI Attribution Analysis</h1>
        <p className="mt-0.5 text-[13px] text-zinc-500">
          Compare AI vs Human code quality impact
        </p>
      </div>

      {!projectId && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20">
          <p className="text-sm text-zinc-500">Select a project to view attribution data</p>
        </div>
      )}

      {loading && projectId && (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      )}

      {attr && !loading && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SummaryCard label="AI Files" value={attr.summary.aiFileCount} color="indigo" />
            <SummaryCard label="Human Files" value={attr.summary.humanFileCount} color="blue" />
            <SummaryCard label="AI PRs" value={attr.summary.aiPrCount} color="indigo" />
            <SummaryCard label="Human PRs" value={attr.summary.humanPrCount} color="blue" />
          </div>

          <div className="card-base p-5 space-y-6">
            <h2 className="text-[13px] font-semibold text-zinc-300">Side-by-Side Comparison</h2>
            <ComparisonBar
              label="Complexity"
              aiValue={attr.complexity.aiAvg}
              humanValue={attr.complexity.humanAvg}
              verdict={attr.complexity.verdict}
              lowerIsBetter
            />
            <ComparisonBar
              label="Change Frequency"
              aiValue={attr.stability.aiChangeFreq}
              humanValue={attr.stability.humanChangeFreq}
              verdict={attr.stability.verdict}
              lowerIsBetter
            />
            <ComparisonBar
              label="Major Revision Rate"
              aiValue={attr.quality.aiMajorRevisionRate}
              humanValue={attr.quality.humanMajorRevisionRate}
              verdict={
                attr.quality.aiMajorRevisionRate <= attr.quality.humanMajorRevisionRate
                  ? 'AI has fewer major revisions'
                  : 'AI has more major revisions'
              }
              lowerIsBetter
            />
            <ComparisonBar
              label="Rollback Rate"
              aiValue={attr.quality.aiRollbackRate}
              humanValue={attr.quality.humanRollbackRate}
              verdict={
                attr.quality.aiRollbackRate <= attr.quality.humanRollbackRate
                  ? 'AI has fewer rollbacks'
                  : 'AI has more rollbacks'
              }
              lowerIsBetter
            />
          </div>
        </>
      )}

      {failed && !loading && (
        <div className="card-base overflow-hidden">
          <div className="border-b border-zinc-800 px-5 py-3">
            <h2 className="text-[13px] font-semibold text-zinc-300">Failed PR Attribution</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Total failed: {failed.totalFailed}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="px-5 py-2.5 text-left font-medium text-zinc-500">Category</th>
                  <th className="px-5 py-2.5 text-left font-medium text-zinc-500">Total</th>
                  <th className="px-5 py-2.5 text-left font-medium text-zinc-500">AI-Generated</th>
                  <th className="px-5 py-2.5 text-left font-medium text-zinc-500">Human</th>
                  <th className="px-5 py-2.5 text-left font-medium text-zinc-500">AI %</th>
                </tr>
              </thead>
              <tbody>
                <FailedRow label="Major Revisions" count={failed.majorRevisions.count} aiCount={failed.majorRevisions.aiCount} />
                <FailedRow label="Rollbacks" count={failed.rollbacks.count} aiCount={failed.rollbacks.aiCount} />
                <FailedRow label="High Review Rounds" count={failed.highReviewRounds.count} aiCount={failed.highReviewRounds.aiCount} />
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  const bgMap: Record<string, string> = {
    indigo: 'bg-indigo-500/10 text-indigo-400',
    blue: 'bg-blue-500/10 text-blue-400',
  };
  return (
    <div className="card-base p-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${bgMap[color] ? 'text-zinc-100' : 'text-zinc-100'}`}>
        {value}
      </p>
    </div>
  );
}

function FailedRow({ label, count, aiCount }: { label: string; count: number; aiCount: number }) {
  const humanCount = count - aiCount;
  const aiPercent = count > 0 ? ((aiCount / count) * 100).toFixed(0) : '0';
  return (
    <tr className="border-b border-zinc-800/30 transition-colors hover:bg-zinc-800/20">
      <td className="px-5 py-2.5 text-zinc-300">{label}</td>
      <td className="px-5 py-2.5 text-zinc-400">{count}</td>
      <td className="px-5 py-2.5 text-zinc-400">{aiCount}</td>
      <td className="px-5 py-2.5 text-zinc-400">{humanCount}</td>
      <td className="px-5 py-2.5">
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
            Number(aiPercent) > 50
              ? 'bg-red-500/10 text-red-400'
              : 'bg-emerald-500/10 text-emerald-400'
          }`}
        >
          {aiPercent}%
        </span>
      </td>
    </tr>
  );
}
