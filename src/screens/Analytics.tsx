'use client';

import React, { useState } from 'react';
import { format, subDays, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { useStore } from '../context/StoreContext';
import { getCurrencySymbol } from '../utils/currency';
import { AnalyticsChart } from '../components/dashboard/AnalyticsChart';
import { TrafficAnalytics } from '../components/dashboard/TrafficAnalytics';
import { UpgradeModal, useUpgradeModal } from '../components/billing/UpgradeModal';
import { Lock, BarChart3, Zap } from 'lucide-react';

export function Analytics() {
  const { analytics, orders, store, user } = useStore();
  const upgradeModal = useUpgradeModal();
  const isPro = user?.plan === 'Pro';

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const last7DaysStart = format(subDays(today, 6), 'yyyy-MM-dd');
  const last30DaysStart = format(subDays(today, 29), 'yyyy-MM-dd');

  const [dateRange, setDateRange] = useState({ start: last7DaysStart, end: todayStr });

  const currencySymbol = getCurrencySymbol(store.currency);

  if (!isPro) {
    return (
      <div className="space-y-3 pb-4">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 pt-3.5 pb-2 border-b border-gray-50">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Analytics</p>
          </div>
          <div className="flex flex-col items-center text-center px-6 py-14 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-gray-400" />
            </div>
            <div>
              <p className="text-base font-black text-gray-900">Analytics is a Pro feature</p>
              <p className="text-sm text-gray-400 font-medium mt-1 max-w-xs">
                Track store views, WhatsApp clicks, revenue trends, traffic sources and more.
              </p>
            </div>
            <button
              onClick={upgradeModal.open}
              className="h-10 px-6 rounded-xl bg-[#1a1a1a] text-white text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors"
            >
              <Zap className="w-4 h-4" /> Upgrade to Pro
            </button>
            <p className="text-xs text-gray-400">₹349/month · Cancel anytime</p>
          </div>
        </div>
        <UpgradeModal isOpen={upgradeModal.isOpen} onClose={upgradeModal.close} />
      </div>
    );
  }

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
    <div className="space-y-3 pb-4">

      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 pt-3.5 pb-3">
          <h2 className="text-[18px] font-bold text-gray-900">Analytics</h2>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Historical performance by date range</p>
        </div>

        {/* Date range selector */}
        <div className="border-t border-gray-50 px-4 py-3 flex flex-col gap-3">
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
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="h-8 px-2 text-xs border border-gray-200 rounded-lg flex-1 text-gray-700 outline-none focus:border-[#059669]"
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
              className="h-8 px-2 text-xs border border-gray-200 rounded-lg flex-1 text-gray-700 outline-none focus:border-[#059669]"
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
      </div>

      {/* Summary stat cards */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 pt-3.5 pb-2 border-b border-gray-50">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Summary</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-gray-50">
          {[
            { label: 'Views', value: rangeViews },
            { label: 'Clicks', value: rangeClicks },
            { label: 'Orders', value: rangeOrdersCount },
            { label: 'Revenue', value: `${currencySymbol}${rangeRevenue.toFixed(2)}` },
            { label: 'Conversion', value: `${conversionRate}%` },
            { label: 'Avg. order', value: `${currencySymbol}${avgOrderValue}` },
          ].map(({ label, value }) => (
            <div key={label} className="p-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
              <p className="text-[20px] font-black text-gray-900 leading-tight mt-1">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 pt-3.5 pb-2 border-b border-gray-50">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Trend</p>
        </div>
        <div className="p-3">
          <AnalyticsChart
            data={filteredDailyStats}
            subtitle={`${format(parseISO(dateRange.start), 'MMM dd, yyyy')} — ${format(parseISO(dateRange.end), 'MMM dd, yyyy')}`}
          />
        </div>
      </div>

      {/* Traffic breakdown */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 pt-3.5 pb-2 border-b border-gray-50">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Traffic breakdown</p>
        </div>
        <div className="p-3">
          <TrafficAnalytics
            sourceSummary={analytics.sourceSummary}
            countrySummary={analytics.countrySummary}
          />
        </div>
      </div>

    </div>
  );
}
