import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsChartProps {
  data: any[];
  subtitle?: string;
}

export function AnalyticsChart({ data, subtitle = "Last 7 days performance" }: AnalyticsChartProps) {
  return (
    <div>
      <div className="mb-1 px-1">
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              dx={-10}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Line type="monotone" dataKey="views" stroke="#059669" strokeWidth={2} dot={{ r: 4, fill: '#059669', strokeWidth: 0 }} activeDot={{ r: 6 }} name="Views" />
            <Line type="monotone" dataKey="clicks" stroke="#14B8A6" strokeWidth={2} dot={{ r: 4, fill: '#14B8A6', strokeWidth: 0 }} activeDot={{ r: 6 }} name="Clicks" />
            <Line type="monotone" dataKey="orders" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4, fill: '#F59E0B', strokeWidth: 0 }} activeDot={{ r: 6 }} name="Orders" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
