'use client';

import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  delta?: number | null;
  invertDelta?: boolean;
  color?: 'blue' | 'green' | 'red' | 'amber' | 'indigo' | 'violet';
  icon?: ReactNode;
}

const borderColorMap: Record<string, string> = {
  blue: 'border-l-blue-500',
  green: 'border-l-emerald-500',
  red: 'border-l-red-500',
  amber: 'border-l-amber-500',
  indigo: 'border-l-indigo-500',
  violet: 'border-l-violet-500',
};

const iconBgMap: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-400',
  green: 'bg-emerald-500/10 text-emerald-400',
  red: 'bg-red-500/10 text-red-400',
  amber: 'bg-amber-500/10 text-amber-400',
  indigo: 'bg-indigo-500/10 text-indigo-400',
  violet: 'bg-violet-500/10 text-violet-400',
};

export function MetricCard({
  title,
  value,
  subtitle,
  delta,
  invertDelta = false,
  color = 'blue',
  icon,
}: MetricCardProps) {
  const isPositive = delta != null && (invertDelta ? delta < 0 : delta > 0);
  const isNegative = delta != null && (invertDelta ? delta > 0 : delta < 0);

  return (
    <div
      className={`card-base border-l-2 ${borderColorMap[color] ?? 'border-l-indigo-500'} p-4 transition-all duration-200 hover:border-zinc-700`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-bold tracking-tight text-zinc-100">{value}</p>
            {delta != null && (
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  isPositive
                    ? 'text-emerald-400'
                    : isNegative
                      ? 'text-red-400'
                      : 'text-zinc-500'
                }`}
              >
                {isPositive ? (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                ) : isNegative ? (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
                  </svg>
                ) : null}
                {Math.abs(delta).toFixed(1)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1.5 text-[11px] text-zinc-600">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBgMap[color] ?? 'bg-indigo-500/10 text-indigo-400'}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
