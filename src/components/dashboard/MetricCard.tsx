import { ReactNode } from 'react';
import { Card } from '../ui/Card';

interface MetricCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle: string;
  valueColor?: string;
}

export function MetricCard({ icon, title, value, subtitle, valueColor = "text-gray-900" }: MetricCardProps) {
  return (
    <Card className="p-5 flex flex-col justify-between">
      <div className="flex items-center gap-2 text-gray-500 mb-3">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div>
        <div className={`text-2xl sm:text-3xl font-bold ${valueColor}`}>{value}</div>
        <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
      </div>
    </Card>
  );
}
