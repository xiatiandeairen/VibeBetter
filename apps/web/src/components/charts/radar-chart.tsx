'use client';

import ReactECharts from 'echarts-for-react';

interface RadarChartProps {
  title?: string;
  indicators: Array<{ name: string; max: number }>;
  values: number[];
  loading?: boolean;
}

export function RadarChart({ title, indicators, values, loading }: RadarChartProps) {
  const option = {
    title: title
      ? {
          text: title,
          textStyle: { fontSize: 14, fontWeight: 600, color: '#a1a1aa' },
          left: 'center',
        }
      : undefined,
    radar: {
      indicator: indicators,
      shape: 'circle' as const,
      splitNumber: 4,
      axisName: { color: '#71717a', fontSize: 11 },
      splitLine: { lineStyle: { color: '#27272a' } },
      splitArea: { areaStyle: { color: ['transparent'] } },
      axisLine: { lineStyle: { color: '#3f3f46' } },
    },
    series: [
      {
        type: 'radar' as const,
        data: [
          {
            value: values,
            areaStyle: { color: 'rgba(99,102,241,0.15)' },
            lineStyle: { color: '#6366f1', width: 2 },
            itemStyle: { color: '#6366f1' },
          },
        ],
      },
    ],
    tooltip: { trigger: 'item' as const },
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : (
        <ReactECharts option={option} style={{ height: 280 }} />
      )}
    </div>
  );
}
