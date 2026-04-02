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

  const moduleClass =
    'overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]';
  const moduleHeadClass =
    'border-b border-slate-200 bg-slate-50/95 px-4 py-2.5 sm:px-5';
  const moduleHeadLabelClass =
    'text-[11px] font-semibold uppercase tracking-wider text-slate-500';

  if (!isPro) {
    return (
      <div className="space-y-4 pb-4">
        <div className={moduleClass}>
          <div className={moduleHeadClass}>
            <p className={moduleHeadLabelClass}>Analytics</p>
          </div>
          <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
              <BarChart3 className="h-7 w-7 text-slate-400" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">Analytics is a Pro feature</p>
              <p className="mt-1 max-w-xs text-sm font-medium text-slate-500">
                Track store views, WhatsApp clicks, revenue trends, traffic sources and more.
              </p>
            </div>
            <button
              type="button"
              onClick={upgradeModal.open}
              className="flex h-10 items-center gap-2 rounded-lg bg-slate-800 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-900"
            >
              <Zap className="h-4 w-4" /> Upgrade to Pro
            </button>
            <p className="text-xs font-medium text-slate-400">₹349/month · Cancel anytime</p>
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
    <div className="space-y-4 pb-4">

      {/* Header */}
      <div className={moduleClass}>
        <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Analytics</h2>
          <p className="mt-0.5 text-sm font-medium text-slate-500">Historical performance by date range</p>
        </div>

        {/* Date range selector — full-width band; controls capped so inputs stay compact */}
        <div className="w-full border-t border-slate-100 bg-slate-50/60 pl-4 pr-6 py-3 sm:pr-7">
          <div className="flex w-full max-w-sm flex-col gap-3">
            <div className="flex flex-wrap gap-2">
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
                    type="button"
                    className={`h-9 rounded-md border px-3.5 text-[13px] font-semibold transition-colors ${
                      active
                        ? 'border-slate-800 bg-slate-800 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="flex max-w-full flex-wrap items-center gap-2">
              <input
                type="date"
                className="h-9 min-w-0 max-w-[10rem] flex-1 rounded-md border border-slate-200 bg-white px-2.5 text-[13px] text-slate-800 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                value={dateRange.start}
                max={dateRange.end}
                onChange={e => {
                  const val = e.target.value;
                  if (val <= dateRange.end) setDateRange(prev => ({ ...prev, start: val }));
                }}
              />
              <span className="shrink-0 text-xs font-medium text-slate-400">to</span>
              <input
                type="date"
                className="h-9 min-w-0 max-w-[10rem] flex-1 rounded-md border border-slate-200 bg-white px-2.5 text-[13px] text-slate-800 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
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
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <SnapshotCard
          icon={<Eye style={{ color: '#3b82f6', width: 18, height: 18 }} />}
          accentColor="#3b82f6"
          accentBg="#eff6ff"
          value={rangeViews}
          label="Store views"
        />
        <SnapshotCard
          icon={<MessageCircle style={{ color: '#059669', width: 18, height: 18 }} />}
          accentColor="#059669"
          accentBg="#ecfdf5"
          value={rangeClicks}
          label="WhatsApp clicks"
        />
        <SnapshotCard
          icon={<Package className="w-4.5 h-4.5" style={{ color: '#f59e0b', width: 18, height: 18 }} />}
          accentColor="#f59e0b"
          accentBg="#fffbeb"
          value={rangeOrdersCount}
          label="Orders"
        />
        <SnapshotCard
          icon={<DollarSign style={{ color: '#10b981', width: 18, height: 18 }} />}
          accentColor="#10b981"
          accentBg="#ecfdf5"
          value={rangeRevenue.toFixed(2)}
          prefix={currencySymbol}
          label="Revenue"
        />
        <SnapshotCard
          icon={<Target style={{ color: '#8b5cf6', width: 18, height: 18 }} />}
          accentColor="#8b5cf6"
          accentBg="#f5f3ff"
          value={`${conversionRate}%`}
          label="Conversion"
        />
        <SnapshotCard
          icon={<BarChart2 style={{ color: '#f97316', width: 18, height: 18 }} />}
          accentColor="#f97316"
          accentBg="#fff7ed"
          value={avgOrderValue}
          prefix={currencySymbol}
          label="Avg. order"
        />
      </div>

      {/* Chart */}
      <div className={moduleClass}>
        <div className={moduleHeadClass}>
          <p className={moduleHeadLabelClass}>Performance trend</p>
        </div>
        <div className="border-t border-slate-100 bg-white p-4 sm:p-5">
          <AnalyticsChart
            data={filteredDailyStats}
            subtitle={`${format(parseISO(dateRange.start), 'MMM dd, yyyy')} — ${format(parseISO(dateRange.end), 'MMM dd, yyyy')}`}
          />
        </div>
      </div>

      {/* Traffic breakdown */}
      <div className={moduleClass}>
        <div className={moduleHeadClass}>
          <p className={moduleHeadLabelClass}>Traffic & audience</p>
        </div>
        <div className="border-t border-slate-100 bg-white p-4 sm:p-5">
          <TrafficAnalytics
            sourceSummary={analytics.sourceSummary}
            countrySummary={analytics.countrySummary}
          />
        </div>
      </div>

    </div>
  );
}
