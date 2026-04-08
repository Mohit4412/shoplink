import { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

export type Trend = {
  direction: 'up' | 'down' | 'flat';
  percentage: string;
  label: string;
};

function TrendBadge({ trend }: { trend: Trend }) {
  const color =
    trend.direction === 'up' ? 'text-emerald-600' :
    trend.direction === 'down' ? 'text-red-500' : 'text-zinc-400';
  return (
    <div className={`flex items-center gap-0.5 text-xs font-semibold ${color}`}>
      {trend.direction === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> :
       trend.direction === 'down' ? <ArrowDownRight className="w-3.5 h-3.5" /> :
       <Minus className="w-3.5 h-3.5" />}
      {trend.percentage}
    </div>
  );
}

export function SnapshotCard({
  icon,
  accentColor,
  value,
  label,
  trend,
  prefix = '',
}: {
  icon: ReactNode;
  accentColor: string;
  accentBg?: string;
  value: number | string;
  label: string;
  trend?: Trend;
  prefix?: string;
}) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accentColor}15` }}>
          {icon}
        </div>
        {trend && <TrendBadge trend={trend} />}
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-900 leading-none tracking-tight">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="mt-1 text-xs font-medium text-zinc-500">{label}</p>
      </div>
    </div>
  );
}
