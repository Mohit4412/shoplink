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
    <div
      className="rounded-2xl p-4 flex flex-col gap-3 bg-[var(--app-panel)] border shadow-[0_1px_0_rgba(0,0,0,0.03)]"
      style={{ borderColor: 'var(--app-border)' }}
    >
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}14` }}>
          {icon}
        </div>
        {trend && <TrendBadge trend={trend} />}
      </div>
      <div>
        <p className="text-[28px] font-semibold text-[var(--app-text)] leading-none tracking-[-0.03em]">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="mt-1 text-xs font-medium text-[var(--app-text-muted)]">{label}</p>
      </div>
    </div>
  );
}
