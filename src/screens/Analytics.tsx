'use client';

import { useState } from 'react';
import { format, subDays, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { useStore } from '../context/StoreContext';
import { getCurrencySymbol } from '../utils/currency';
import { AnalyticsChart } from '../components/dashboard/AnalyticsChart';
import { TrafficAnalytics } from '../components/dashboard/TrafficAnalytics';
import { UpgradeModal, useUpgradeModal } from '../components/billing/UpgradeModal';
import { BarChart3, Eye, MessageCircle, Package, DollarSign, Target, BarChart2, Zap } from 'lucide-react';
import { SnapshotCard } from '../components/dashboard/SnapshotCard';

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
      <div className="space-y-4 pb-4">
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <div className="border-b border-zinc-100 px-5 py-3.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Analytics</p>
          </div>
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50">
              <BarChart3 className="h-6 w-6 text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">Analytics is a Pro feature</p>
              <p className="mt-1 max-w-xs text-sm text-zinc-500">
                Track store views, WhatsApp clicks, revenue trends, traffic sources and more.
              </p>
            </div>
            <button
              type="button"
              onClick={upgradeModal.open}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-900 px-5 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
            >
              <Zap className="h-4 w-4" /> Upgrade to Pro
            </button>
            <p className="text-xs text-zinc-400">₹349/month · Cancel anytime</p>
          </div>
        </div>
        <UpgradeModal isOpen={upgradeModal.isOpen} onClose={upgradeModal.close} />
      </div>
    );
  }

  const filteredDailyStats = analytics.dailyStats.filter(
    s => s.fullDate >= dateRange.start && s.fullDate <= dateRange.end
  );
  const filteredOrders = orders.filter(o =>
    isWithinInterval(parseISO(o.date), {
      start: startOfDay(parseISO(dateRange.start)),
      end: endOfDay(parseISO(dateRange.end)),
    })
  );

  const rangeViews = filteredDailyStats.reduce((s, d) => s + d.views, 0);
  const rangeClicks = filteredDailyStats.reduce((s, d) => s + d.clicks, 0);
  const rangeOrdersCount = filteredOrders.length;
  const rangeRevenue = filteredOrders.reduce((s, o) => s + o.revenue, 0);
  const conversionRate = rangeClicks > 0 ? ((rangeOrdersCount / rangeClicks) * 100).toFixed(1) : '0.0';
  const avgOrderValue = rangeOrdersCount > 0 ? (rangeRevenue / rangeOrdersCount).toFixed(2) : '0.00';

  const isTodayRange = dateRange.end === todayStr && dateRange.start === todayStr;
  const isLast7Days = dateRange.end === todayStr && dateRange.start === last7DaysStart;
  const isLast30Days = dateRange.end === todayStr && dateRange.start === last30DaysStart;

  const presets = [
    { label: 'Today', start: todayStr, end: todayStr, active: isTodayRange },
    { label: 'Last 7 days', start: last7DaysStart, end: todayStr, active: isLast7Days },
    { label: 'Last 30 days', start: last30DaysStart, end: todayStr, active: isLast30Days },
  ];

  return (
    <div className="space-y-5 pb-6">

      {/* Header + date range */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h2 className="text-base font-semibold text-zinc-900">Analytics</h2>
          <p className="mt-0.5 text-sm text-zinc-500">Historical performance by date range</p>
        </div>
        <div className="px-5 py-4 bg-zinc-50/50">
          <div className="flex flex-col gap-3 max-w-sm">
            <div className="flex flex-wrap gap-2">
              {presets.map(({ label, start, end, active }) => (
                <button key={label} type="button" onClick={() => setDateRange({ start, end })}
                  className={`h-8 rounded-lg border px-3 text-xs font-semibold transition-colors ${
                    active
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="date"
                className="h-9 flex-1 min-w-0 rounded-lg border border-zinc-200 bg-white px-2.5 text-sm text-zinc-800 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
                value={dateRange.start} max={dateRange.end}
                onChange={e => { if (e.target.value <= dateRange.end) setDateRange(p => ({ ...p, start: e.target.value })); }}
              />
              <span className="shrink-0 text-xs text-zinc-400">to</span>
              <input type="date"
                className="h-9 flex-1 min-w-0 rounded-lg border border-zinc-200 bg-white px-2.5 text-sm text-zinc-800 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
                value={dateRange.end} min={dateRange.start} max={todayStr}
                onChange={e => { if (e.target.value >= dateRange.start && e.target.value <= todayStr) setDateRange(p => ({ ...p, end: e.target.value })); }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <SnapshotCard icon={<Eye style={{ color: '#3b82f6', width: 16, height: 16 }} />} accentColor="#3b82f6" value={rangeViews} label="Store views" />
        <SnapshotCard icon={<MessageCircle style={{ color: '#059669', width: 16, height: 16 }} />} accentColor="#059669" value={rangeClicks} label="WhatsApp clicks" />
        <SnapshotCard icon={<Package style={{ color: '#f59e0b', width: 16, height: 16 }} />} accentColor="#f59e0b" value={rangeOrdersCount} label="Orders" />
        <SnapshotCard icon={<DollarSign style={{ color: '#10b981', width: 16, height: 16 }} />} accentColor="#10b981" value={rangeRevenue.toFixed(2)} prefix={currencySymbol} label="Revenue" />
        <SnapshotCard icon={<Target style={{ color: '#8b5cf6', width: 16, height: 16 }} />} accentColor="#8b5cf6" value={`${conversionRate}%`} label="Conversion" />
        <SnapshotCard icon={<BarChart2 style={{ color: '#f97316', width: 16, height: 16 }} />} accentColor="#f97316" value={avgOrderValue} prefix={currencySymbol} label="Avg. order" />
      </div>

      {/* Chart */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="border-b border-zinc-100 px-5 py-3.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Performance trend</p>
        </div>
        <div className="p-5">
          <AnalyticsChart
            data={filteredDailyStats}
            subtitle={`${format(parseISO(dateRange.start), 'MMM dd, yyyy')} — ${format(parseISO(dateRange.end), 'MMM dd, yyyy')}`}
          />
        </div>
      </div>

      {/* Traffic */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="border-b border-zinc-100 px-5 py-3.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Traffic & audience</p>
        </div>
        <div className="p-5">
          <TrafficAnalytics sourceSummary={analytics.sourceSummary} countrySummary={analytics.countrySummary} />
        </div>
      </div>

    </div>
  );
}
