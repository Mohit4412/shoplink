import { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

export type Trend = {
  direction: 'up' | 'down' | 'flat';
  percentage: string;
  label: string;
};

function TrendBadge({ trend }: { trend: Trend }) {
  const styles =
    trend.direction === 'up'
      ? 'text-green-600'
      : trend.direction === 'down'
        ? 'text-red-500'
        : 'text-slate-400';

  return (
    <div className={`flex flex-col items-end text-right leading-none ${styles}`}>
      <div className="flex items-center gap-1 text-[11px] font-semibold">
        {trend.direction === 'up' ? (
          <ArrowUpRight className="w-3.5 h-3.5" />
        ) : trend.direction === 'down' ? (
          <ArrowDownRight className="w-3.5 h-3.5" />
        ) : (
          <Minus className="w-3.5 h-3.5" />
        )}
        <span>{trend.percentage}</span>
      </div>
      <span className="mt-1 text-[10px] font-medium text-slate-500">{trend.label}</span>
    </div>
  );
}

export function SnapshotCard({
  icon,
  accentColor,
  accentBg,
  value,
  label,
  trend,
  prefix = '',
}: {
  icon: ReactNode;
  accentColor: string;
  accentBg: string;
  value: number | string;
  label: string;
  trend?: Trend;
  prefix?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-md">
      <div className="absolute bottom-0 left-0 top-0 w-1 rounded-l-lg" style={{ background: accentColor }} />

      <div className="pl-4 pr-3 pt-3.5 pb-3.5 sm:pl-5 sm:pr-4 sm:pt-4 sm:pb-4">
        <div className={`flex items-start justify-between ${trend ? 'mb-3 sm:mb-4' : 'mb-2.5 sm:mb-3'}`}>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: accentBg }}>
            {icon}
          </div>
          {trend ? <TrendBadge trend={trend} /> : null}
        </div>

        <p className="text-[22px] sm:text-[28px] font-black leading-none tracking-tight text-slate-900">
          {prefix}
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>

        <p className="mt-1.5 text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      </div>
    </div>
  );
}

