'use client';

import React, { useState } from 'react';
import { Plus, Share2, Calendar, Sparkles, Package, CheckCircle2, ChevronRight, Store, Upload } from 'lucide-react';
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

  const storeUrl = user?.username && origin ? `${origin}/${user.username}` : '';

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


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Hi <span className="font-bold text-blue-600">{user?.firstName || 'there'}</span>, Manage your store and track performance.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">

          <Button 
            variant="outline" 
            onClick={() => setIsShareModalOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Link
          </Button>
          <Button 
            variant="outline" 
            className="border-green-600 text-green-700 hover:bg-green-50 flex-1 sm:flex-none"
            onClick={openNewOrderModal}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Manual Order
          </Button>
        </div>
      </div>


      {/* Date Range Selector */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span className="font-medium">Performance Period:</span>
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
            {rangeLabel}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 justify-between sm:justify-start">
            <span className="text-xs text-gray-500 uppercase font-bold w-10 sm:w-auto">From</span>
            <Input 
              type="date" 
              className="h-9 py-1 text-xs flex-1 sm:w-36" 
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
          <div className="flex items-center gap-2 justify-between sm:justify-start">
            <span className="text-xs text-gray-500 uppercase font-bold w-10 sm:w-auto">To</span>
            <Input 
              type="date" 
              className="h-9 py-1 text-xs flex-1 sm:w-36" 
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
          <div className="flex gap-2 sm:ml-2 mt-2 sm:mt-0">
            <Button 
              variant="outline" 
              className={`h-9 px-3 text-xs flex-1 sm:flex-none justify-center ${isTodayRange ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
              onClick={() => setDateRange({
                start: todayStr,
                end: todayStr,
              })}
            >
              Today
            </Button>
            <Button 
              variant="outline" 
              className={`h-9 px-3 text-xs flex-1 sm:flex-none justify-center ${isLast7Days ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
              onClick={() => setDateRange({
                start: last7DaysStart,
                end: todayStr,
              })}
            >
              Last 7d
            </Button>
            <Button 
              variant="outline" 
              className={`h-9 px-3 text-xs flex-1 sm:flex-none justify-center ${isLast30Days ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
              onClick={() => setDateRange({
                start: last30DaysStart,
                end: todayStr,
              })}
            >
              Last 30d
            </Button>
          </div>
        </div>
      </div>

      {(!store.logoUrl || products.length === 0) && (
        <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-6 shadow-sm overflow-hidden relative">
          <div className="absolute -top-10 -right-10 text-indigo-100 opacity-50">
            <Store className="w-40 h-40" />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Store Setup Guide
            </h2>
            <p className="text-sm text-gray-500 mt-1 mb-6">Complete these steps to launch your store beautifully.</p>
            
            <div className="space-y-3">
              <Link href="/settings" className="flex items-center gap-4 bg-white border border-gray-100 p-4 rounded-xl hover:shadow-md transition-shadow group">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${store.logoUrl ? 'bg-green-100 text-green-600' : 'bg-gray-100 border border-gray-300'}`}>
                  {store.logoUrl && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold text-sm ${store.logoUrl ? 'text-gray-500 line-through' : 'text-gray-900'}`}>Upload store logo</h3>
                  {!store.logoUrl && <p className="text-xs text-gray-500">Make your store look professional</p>}
                </div>
                <Upload className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
              </Link>

              <Link href="/products" className="flex items-center gap-4 bg-white border border-gray-100 p-4 rounded-xl hover:shadow-md transition-shadow group">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${products.length > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 border border-gray-300'}`}>
                  {products.length > 0 && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold text-sm ${products.length > 0 ? 'text-gray-500 line-through' : 'text-gray-900'}`}>Add your first product</h3>
                  {products.length === 0 && <p className="text-xs text-gray-500">You need products to sell</p>}
                </div>
                <Package className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
              </Link>

              <button onClick={() => setIsShareModalOpen(true)} className="w-full flex items-center gap-4 bg-white border border-gray-100 p-4 rounded-xl hover:shadow-md transition-shadow group text-left">
                <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-gray-900">Share your store link</h3>
                  <p className="text-xs text-gray-500">Put it your Instagram bio & WhatsApp</p>
                </div>
                <Share2 className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      )}

      <MetricsGrid 
        productsCount={products.length}
        rangeViews={rangeViews}
        rangeClicks={rangeClicks}
        rangeOrdersCount={rangeOrdersCount}
        rangeRevenue={rangeRevenue}
        conversionRate={rangeConversionRate}
        avgOrderValue={avgOrderValue}
        currencySymbol={currencySymbol}
        periodLabel={rangeLabel}
      />

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

      {orders.length === 0 && (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
            <Package className="w-7 h-7 text-blue-500" />
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
        storeUrl={storeUrl}
      />


    </div>
  );
}
