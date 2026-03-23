'use client';

import React, { useState } from 'react';
import { Plus, Share2, Package, Store, Eye, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useStore } from '../context/StoreContext';
import { getCurrencySymbol } from '../utils/currency';
import { Order } from '../types';
import { Button } from '../components/ui/Button';
import { LogOrderModal } from '../components/dashboard/LogOrderModal';
import { ShareModal } from '../components/dashboard/ShareModal';
import { RecentOrdersTable } from '../components/dashboard/RecentOrdersTable';

export function Dashboard() {
  const { products, analytics, orders, addOrder, updateOrder, deleteOrder, store, user } = useStore();
  const [isLogOrderModalOpen, setIsLogOrderModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const currencySymbol = getCurrencySymbol(store.currency);

  const todayOrdersCount = orders.filter(o => o.date.startsWith(todayStr)).length;
  const todayStats = analytics.dailyStats.find(s => s.fullDate === todayStr) || { views: 0, clicks: 0 };
  const activeProductsCount = products.length;

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
    <div className="space-y-6 max-w-[500px] mx-auto pb-4">

      {/* Greeting */}
      <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4 sm:px-5">
        <h1 className="text-[18px] font-bold text-gray-900 leading-tight">
          Hello {user?.firstName || 'there'} <span className="inline-block animate-wave">👋</span>
        </h1>
        <p className="text-[13px] text-gray-500 font-medium mt-1">Here's your store activity today.</p>
      </div>

      {/* 2x2 Today Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-[22px] font-black text-gray-900 leading-none">{todayOrdersCount}</p>
            <p className="text-[12px] font-semibold text-gray-500 mt-1">Orders (today)</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-[22px] font-black text-gray-900 leading-none">{todayStats.views}</p>
            <p className="text-[12px] font-semibold text-gray-500 mt-1">Store views (today)</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
            <Store className="w-4 h-4 text-[#25D366]" />
          </div>
          <div>
            <p className="text-[22px] font-black text-gray-900 leading-none">{activeProductsCount}</p>
            <p className="text-[12px] font-semibold text-gray-500 mt-1">Active products</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
          </div>
          <div>
            <p className="text-[22px] font-black text-gray-900 leading-none">{todayStats.clicks}</p>
            <p className="text-[12px] font-semibold text-gray-500 mt-1">WhatsApp clicks</p>
          </div>
        </div>
      </div>

      {/* Plan Status */}
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

      {/* Product limit warning — Free plan, 8+ products */}
      {(!user?.plan || user.plan === 'Free') && activeProductsCount >= 8 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-red-800">
              {activeProductsCount >= 10 ? 'Product limit reached' : `Almost at your limit`}
            </p>
            <p className="text-[11px] text-red-600 mt-0.5">
              {activeProductsCount >= 10
                ? 'You\'ve used all 10 free product slots. Upgrade to add more.'
                : `${activeProductsCount}/10 products used — only ${10 - activeProductsCount} slot${10 - activeProductsCount === 1 ? '' : 's'} left.`}
            </p>
          </div>
          <Link href="/settings?view=billing" className="text-xs font-bold bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors shrink-0 ml-3">
            Upgrade &rarr;
          </Link>
        </div>
      )}

      {/* Quick Actions */}
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
        <Link
          href={`/${user?.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors shadow-sm"
        >
          <Eye className="w-4 h-4 text-gray-500" /> View Store
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">Recent orders</h2>
          {orders.length > 0 && (
            <span className="text-xs text-gray-400">{orders.length} total</span>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center text-center gap-3">
            <Package className="w-8 h-8 text-gray-300" />
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">No orders yet</h3>
              <p className="text-xs text-gray-400 mt-1">Log your first order to track revenue.</p>
            </div>
            <Button onClick={openNewOrderModal}>
              <Plus className="w-4 h-4 mr-2" />
              Log First Order
            </Button>
          </div>
        ) : (
          <RecentOrdersTable
            orders={orders.slice(0, 10)}
            products={products}
            currencySymbol={currencySymbol}
            onEditOrder={handleEditOrder}
            onDeleteOrder={handleDeleteOrder}
          />
        )}
      </div>

      <LogOrderModal
        isOpen={isLogOrderModalOpen}
        onClose={() => { setIsLogOrderModalOpen(false); setSelectedOrder(null); }}
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
