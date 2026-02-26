'use client';

import { memo, useMemo } from 'react';
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

const COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444'];

export const LineChart = memo(function LineChart({ title, xData, series, loading = false }: LineChartProps) {
  const option: EChartsOption = useMemo(() => ({
    title: title
      ? {
          text: title,
          textStyle: { fontSize: 13, fontWeight: 600, color: '#a1a1aa' },
          left: 16,
          top: 12,
        }
      : undefined,
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#18181b',
      borderColor: '#27272a',
      borderWidth: 1,
      textStyle: { color: '#e4e4e7', fontSize: 12 },
      axisPointer: {
        lineStyle: { color: '#3f3f46', type: 'dashed' },
      },
    },
    legend: {
      bottom: 8,
      textStyle: { color: '#71717a', fontSize: 11 },
      itemWidth: 12,
      itemHeight: 2,
    },
    grid: {
      top: title ? 52 : 24,
      left: 48,
      right: 16,
      bottom: 40,
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisLine: { lineStyle: { color: '#27272a' } },
      axisTick: { show: false },
      axisLabel: { color: '#71717a', fontSize: 10, margin: 12 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#27272a', type: 'dashed' } },
      axisLabel: { color: '#71717a', fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: series.map((s, i) => ({
      name: s.name,
      type: 'line' as const,
      data: s.data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      showSymbol: false,
      lineStyle: { width: 2, color: COLORS[i % COLORS.length] },
      itemStyle: { color: COLORS[i % COLORS.length] },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: (COLORS[i % COLORS.length] ?? '#6366f1') + '20' },
            { offset: 1, color: (COLORS[i % COLORS.length] ?? '#6366f1') + '00' },
          ],
        },
      },
      emphasis: {
        focus: 'series',
        itemStyle: { borderWidth: 2 },
      },
    })),
    animationDuration: 600,
    animationEasing: 'cubicOut',
  }), [title, xData, series]);

  return (
    <div className="card-base p-1">
      {loading ? (
        <div className="flex h-[300px] items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : (
        <ReactECharts option={option} style={{ height: 300 }} />
      )}
    </div>
  );
});
