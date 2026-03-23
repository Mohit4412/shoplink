'use client';

import React, { useState } from 'react';
import { format, subDays, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { useStore } from '../context/StoreContext';
import { getCurrencySymbol } from '../utils/currency';
import { AnalyticsChart } from '../components/dashboard/AnalyticsChart';
import { TrafficAnalytics } from '../components/dashboard/TrafficAnalytics';

export function Analytics() {
  const { analytics, orders, store } = useStore();

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const last7DaysStart = format(subDays(today, 6), 'yyyy-MM-dd');
  const last30DaysStart = format(subDays(today, 29), 'yyyy-MM-dd');

  const [dateRange, setDateRange] = useState({ start: last7DaysStart, end: todayStr });

  const currencySymbol = getCurrencySymbol(store.currency);

  const filteredDailyStats = analytics.dailyStats.filter(
    stat => stat.fullDate >= dateRange.start && stat.fullDate <= dateRange.end
  );

  const filteredOrders = orders.filter(o =>
    isWithinInterval(parseISO(o.date), {
      start: startOfDay(parseISO(dateRange.start)),
      end: endOfDay(parseISO(dateRange.end)),
    })
  );

  const rangeViews = filteredDailyStats.reduce((sum, s) => sum + s.views, 0);
  const rangeClicks = filteredDailyStats.reduce((sum, s) => sum + s.clicks, 0);
  const rangeOrdersCount = filteredOrders.length;
  const rangeRevenue = filteredOrders.reduce((sum, o) => sum + o.revenue, 0);
  const conversionRate = rangeClicks > 0 ? ((rangeOrdersCount / rangeClicks) * 100).toFixed(1) : '0.0';
  const avgOrderValue = rangeOrdersCount > 0 ? (rangeRevenue / rangeOrdersCount).toFixed(2) : '0.00';

  const isTodayRange = dateRange.end === todayStr && dateRange.start === todayStr;
  const isLast7Days = dateRange.end === todayStr && dateRange.start === last7DaysStart;
  const isLast30Days = dateRange.end === todayStr && dateRange.start === last30DaysStart;

  return (
    <div className="space-y-6 max-w-[500px] mx-auto pb-4">

      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Analytics</h2>
        <p className="text-xs text-gray-500 font-medium mt-0.5">Historical performance by date range</p>
      </div>

      {/* Date range selector */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-3 flex flex-col gap-3">
        {/* Quick pills */}
        <div className="flex gap-2">
          {[
            { label: 'Today', start: todayStr, end: todayStr },
            { label: 'Last 7 days', start: last7DaysStart, end: todayStr },
            { label: 'Last 30 days', start: last30DaysStart, end: todayStr },
          ].map(({ label, start, end }) => {
            const active =
              (label === 'Today' && isTodayRange) ||
              (label === 'Last 7 days' && isLast7Days) ||
              (label === 'Last 30 days' && isLast30Days);
            return (
              <button
                key={label}
                onClick={() => setDateRange({ start, end })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {/* Inline date inputs */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="h-8 px-2 text-xs border border-gray-200 rounded-lg flex-1 text-gray-700 outline-none focus:border-[#25D366]"
            value={dateRange.start}
            max={dateRange.end}
            onChange={e => {
              const val = e.target.value;
              if (val <= dateRange.end) setDateRange(prev => ({ ...prev, start: val }));
            }}
          />
          <span className="text-xs text-gray-400 shrink-0">to</span>
          <input
            type="date"
            className="h-8 px-2 text-xs border border-gray-200 rounded-lg flex-1 text-gray-700 outline-none focus:border-[#25D366]"
            value={dateRange.end}
            min={dateRange.start}
            max={todayStr}
            onChange={e => {
              const val = e.target.value;
              if (val >= dateRange.start && val <= todayStr) setDateRange(prev => ({ ...prev, end: val }));
            }}
          />
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Views', value: rangeViews },
          { label: 'Clicks', value: rangeClicks },
          { label: 'Orders', value: rangeOrdersCount },
          { label: 'Revenue', value: `${currencySymbol}${rangeRevenue.toFixed(2)}` },
          { label: 'Conversion', value: `${conversionRate}%` },
          { label: 'Avg. order', value: `${currencySymbol}${avgOrderValue}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="text-[20px] font-black text-gray-900 leading-tight mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="w-full overflow-hidden">
        <AnalyticsChart
          data={filteredDailyStats}
          subtitle={`${format(parseISO(dateRange.start), 'MMM dd, yyyy')} — ${format(parseISO(dateRange.end), 'MMM dd, yyyy')}`}
        />
      </div>

      {/* Traffic breakdown */}
      <TrafficAnalytics
        sourceSummary={analytics.sourceSummary}
        countrySummary={analytics.countrySummary}
      />
    </div>
  );
}
