'use client';

import React, { useState } from 'react';
import { Plus, Share2, Calendar, Sparkles, Package, CheckCircle2, ChevronRight, Store, Upload, Eye, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { format, subDays, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getCurrencySymbol } from '../utils/currency';
import { Order } from '../types';

import { MetricsGrid } from '../components/dashboard/MetricsGrid';
import { AnalyticsChart } from '../components/dashboard/AnalyticsChart';
import { TrafficAnalytics } from '../components/dashboard/TrafficAnalytics';
import { LogOrderModal } from '../components/dashboard/LogOrderModal';
import { ShareModal } from '../components/dashboard/ShareModal';

export function Dashboard() {
  const { products, analytics, orders, addOrder, updateOrder, deleteOrder, store, user } = useStore();
  const [isLogOrderModalOpen, setIsLogOrderModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [origin, setOrigin] = useState('');

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const last7DaysStart = format(subDays(today, 6), 'yyyy-MM-dd');
  const last30DaysStart = format(subDays(today, 29), 'yyyy-MM-dd');

  const [dateRange, setDateRange] = useState({
    start: last7DaysStart,
    end: todayStr,
  });

  const currencySymbol = getCurrencySymbol(store.currency);

  const filteredDailyStats = analytics.dailyStats.filter(stat => {
    return stat.fullDate >= dateRange.start && stat.fullDate <= dateRange.end;
  });

  const filteredOrders = orders.filter(o => {
    return isWithinInterval(parseISO(o.date), {
      start: startOfDay(parseISO(dateRange.start)),
      end: endOfDay(parseISO(dateRange.end)),
    });
  });

  const rangeViews = filteredDailyStats.reduce((sum, s) => sum + s.views, 0);
  const rangeClicks = filteredDailyStats.reduce((sum, s) => sum + s.clicks, 0);
  const rangeOrdersCount = filteredOrders.length;
  const rangeRevenue = filteredOrders.reduce((sum, o) => sum + o.revenue, 0);
  const rangeConversionRate = rangeClicks > 0 ? ((rangeOrdersCount / rangeClicks) * 100).toFixed(1) : '0.0';
  const avgOrderValue = rangeOrdersCount > 0 ? (rangeRevenue / rangeOrdersCount).toFixed(2) : '0.00';

  const isTodayRange = dateRange.end === todayStr && dateRange.start === todayStr;
  const isLast7Days = dateRange.end === todayStr && dateRange.start === last7DaysStart;
  const isLast30Days = dateRange.end === todayStr && dateRange.start === last30DaysStart;

  let rangeLabel = `${format(parseISO(dateRange.start), 'MMM dd')} - ${format(parseISO(dateRange.end), 'MMM dd')}`;
  if (isTodayRange) rangeLabel = "Today";
  else if (isLast7Days) rangeLabel = "Last 7 Days";
  else if (isLast30Days) rangeLabel = "Last 30 Days";

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const storeUrl = user?.username ? `https://${user.username}.myshoplink.site` : '';

  const handleSaveOrder = (newOrder: { productId: string; quantity: number; revenue: number; notes: string; date: string }) => {
    if (selectedOrder) {
      updateOrder(selectedOrder.id, newOrder);
    } else {
      addOrder({ ...newOrder, status: 'confirmed' });
    }
    setIsLogOrderModalOpen(false);
    setSelectedOrder(null);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsLogOrderModalOpen(true);
  };

  const handleDeleteOrder = (order: Order) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      deleteOrder(order.id);
    }
  };

  const openNewOrderModal = () => {
    setSelectedOrder(null);
    setIsLogOrderModalOpen(true);
  };


  const todayOrdersCount = orders.filter(o => o.date.startsWith(todayStr)).length;
  const todayStats = analytics.dailyStats.find(s => s.fullDate === todayStr) || { views: 0, clicks: 0 };
  const todayViews = todayStats.views;
  const todayClicks = todayStats.clicks;
  const activeProductsCount = products.length;

  return (
    <div className="space-y-6 max-w-[500px] mx-auto pb-4">
      
      {/* Greeting Card */}
      <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4 sm:px-5">
        <h1 className="text-[18px] font-bold text-gray-900 leading-tight">
          Hello {user?.firstName || 'there'} <span className="inline-block animate-wave">👋</span>
        </h1>
        <p className="text-[13px] text-gray-500 font-medium mt-1">Here's your store activity today.</p>
      </div>

      {/* 2x2 Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between aspect-[4/3]">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mb-2">
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-[22px] font-black text-gray-900 leading-none">{todayOrdersCount}</p>
            <p className="text-[12px] font-semibold text-gray-500 mt-1">Orders (today)</p>
          </div>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between aspect-[4/3]">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-[22px] font-black text-gray-900 leading-none">{todayViews}</p>
            <p className="text-[12px] font-semibold text-gray-500 mt-1">Store views (today)</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between aspect-[4/3]">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center mb-2">
            <Store className="w-4 h-4 text-[#25D366]" />
          </div>
          <div>
            <p className="text-[22px] font-black text-gray-900 leading-none">{activeProductsCount}</p>
            <p className="text-[12px] font-semibold text-gray-500 mt-1">Active products</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between aspect-[4/3]">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center mb-2">
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
          </div>
          <div>
            <p className="text-[22px] font-black text-gray-900 leading-none">{todayClicks}</p>
            <p className="text-[12px] font-semibold text-gray-500 mt-1">WhatsApp clicks</p>
          </div>
        </div>
      </div>

      {/* Plan Status Banner */}
      {(!user?.plan || user.plan === 'Free') ? (
        <div className="bg-[#FFFBEB] border border-amber-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-amber-900">Free plan</h3>
            <p className="text-[11px] font-semibold text-amber-700 mt-0.5">
              {activeProductsCount} products &middot; {Math.max(0, 10 - activeProductsCount)} remaining
            </p>
          </div>
          <Link href="/settings?view=billing" className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors shrink-0">
            Upgrade to Pro &rarr;
          </Link>
        </div>
      ) : (
        <div className="bg-[#F0FDF4] border border-[#25D366]/30 rounded-xl p-4 flex items-center shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-green-900">Pro plan</h3>
            <p className="text-[11px] font-semibold text-green-700 mt-0.5">
              Active until {user?.subscriptionRenewalDate || 'lifetime'}
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions (Replacing old header buttons) */}
      <div className="flex gap-3">
        <button 
          onClick={openNewOrderModal}
          className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 text-gray-500" /> Log Order
        </button>
        <button 
          onClick={() => setIsShareModalOpen(true)}
          className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors shadow-sm"
        >
          <Share2 className="w-4 h-4 text-gray-500" /> Share Store
        </button>
      </div>

      {/* Historical Analytics Section */}
      <div className="pt-4 border-t border-gray-100" id="analytics">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">Historical performance</h2>
          <p className="text-xs text-gray-500 font-medium">Analyze your custom date range</p>
        </div>
        
        {/* Date Range Selector */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 mb-4">
          <div className="flex items-center gap-2 justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">From</span>
            <input 
              type="date" 
              className="h-8 px-2 text-xs border border-gray-200 rounded-lg flex-1 ml-2 text-gray-700 outline-none focus:border-[#25D366]" 
              value={dateRange.start}
              max={dateRange.end}
              onChange={(e) => {
                const val = e.target.value;
                if (val <= dateRange.end) {
                  setDateRange(prev => ({ ...prev, start: val }));
                }
              }}
            />
          </div>
          <div className="flex items-center gap-2 justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">To</span>
            <input 
              type="date" 
              className="h-8 px-2 text-xs border border-gray-200 rounded-lg flex-1 ml-6 text-gray-700 outline-none focus:border-[#25D366]" 
              value={dateRange.end}
              min={dateRange.start}
              max={todayStr}
              onChange={(e) => {
                const val = e.target.value;
                if (val >= dateRange.start && val <= todayStr) {
                  setDateRange(prev => ({ ...prev, end: val }));
                }
              }}
            />
          </div>
        </div>

      <div className="w-full max-w-full overflow-hidden">
        <AnalyticsChart 
          data={filteredDailyStats} 
          subtitle={`Performance from ${format(parseISO(dateRange.start), 'MMM dd, yyyy')} to ${format(parseISO(dateRange.end), 'MMM dd, yyyy')}`}
        />
      </div>

      <TrafficAnalytics
        sourceSummary={analytics.sourceSummary}
        countrySummary={analytics.countrySummary}
      />
      </div>

      {orders.length === 0 && (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand- flex items-center justify-center">
            <Package className="w-7 h-7 text-brand-" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-base">No orders yet</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">Orders appear here after you log them or sync them from a real backend flow. WhatsApp clicks are tracked separately in analytics.</p>
          </div>
          <Button onClick={openNewOrderModal}>
            <Plus className="w-4 h-4 mr-2" />
            Log First Order
          </Button>
        </div>
      )}

      <LogOrderModal 
        isOpen={isLogOrderModalOpen}
        onClose={() => {
          setIsLogOrderModalOpen(false);
          setSelectedOrder(null);
        }}
        products={products}
        currencySymbol={currencySymbol}
        todayStr={todayStr}
        onSave={handleSaveOrder}
        initialData={selectedOrder}
      />

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        username={user?.username || ''}
      />


    </div>
  );
}
