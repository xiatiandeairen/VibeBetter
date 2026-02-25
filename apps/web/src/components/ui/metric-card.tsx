interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'flat';
  color?: 'blue' | 'green' | 'red' | 'amber' | 'indigo';
}

const colorMap = {
  blue: 'text-blue-600 dark:text-blue-400',
  green: 'text-green-600 dark:text-green-400',
  red: 'text-red-600 dark:text-red-400',
  amber: 'text-amber-600 dark:text-amber-400',
  indigo: 'text-indigo-600 dark:text-indigo-400',
} as const;

const trendIcons = {
  up: '↑',
  down: '↓',
  flat: '→',
} as const;

const trendColors = {
  up: 'text-green-500',
  down: 'text-red-500',
  flat: 'text-slate-400',
} as const;

export function MetricCard({ title, value, subtitle, trend, color = 'blue' }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className={`text-3xl font-bold ${colorMap[color]}`}>{value}</p>
        {trend && (
          <span className={`text-sm font-medium ${trendColors[trend]}`}>{trendIcons[trend]}</span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>}
    </div>
  );
}
