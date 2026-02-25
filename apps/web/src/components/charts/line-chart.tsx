'use client';

import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface SeriesItem {
  name: string;
  data: number[];
}

interface LineChartProps {
  title?: string;
  xData: string[];
  series: SeriesItem[];
  loading?: boolean;
}

export function LineChart({ title, xData, series, loading = false }: LineChartProps) {
  const option: EChartsOption = {
    title: title
      ? {
          text: title,
          textStyle: { fontSize: 14, fontWeight: 600, color: '#94a3b8' },
          left: 'center',
        }
      : undefined,
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      textStyle: { color: '#f1f5f9' },
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#94a3b8' },
    },
    grid: {
      top: title ? 50 : 20,
      left: 50,
      right: 20,
      bottom: 40,
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisLine: { lineStyle: { color: '#475569' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#334155', type: 'dashed' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
    },
    series: series.map((s) => ({
      name: s.name,
      type: 'line' as const,
      data: s.data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2 },
    })),
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <ReactECharts option={option} style={{ height: 300 }} />
      )}
    </div>
  );
}
