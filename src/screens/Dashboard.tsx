'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Share2, Package, Store, Eye, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (searchParams.get('upgraded') === '1') {
      setShowCelebration(true);
      // Clean the URL without reloading
      router.replace('/dashboard', { scroll: false });
      // Auto-dismiss after 4s
      const t = setTimeout(() => setShowCelebration(false), 4000);
      return () => clearTimeout(t);
    }
  }, [searchParams, router]);

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
    <div className="space-y-3 max-w-[680px] mx-auto pb-4">

      {/* Greeting */}
      <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl px-4 py-3.5">
        <h1 className="text-[18px] font-bold text-gray-900 leading-tight">
          Hello {user?.firstName || 'there'} <span className="inline-block animate-wave">👋</span>
        </h1>
        <p className="text-[13px] text-gray-500 font-medium mt-0.5">Here's your store activity today.</p>
      </div>

      {/* Today's Metrics */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 pt-3.5 pb-2 border-b border-gray-50">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Today's snapshot</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-gray-50">
          <div className="p-4 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-[22px] font-black text-gray-900 leading-none">{todayOrdersCount}</p>
              <p className="text-[12px] font-semibold text-gray-500 mt-1">Orders</p>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Eye className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-[22px] font-black text-gray-900 leading-none">{todayStats.views}</p>
              <p className="text-[12px] font-semibold text-gray-500 mt-1">Store views</p>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <Store className="w-4 h-4 text-[#059669]" />
            </div>
            <div>
              <p className="text-[22px] font-black text-gray-900 leading-none">{activeProductsCount}</p>
              <p className="text-[12px] font-semibold text-gray-500 mt-1">Active products</p>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-[#059669]" />
            </div>
            <div>
              <p className="text-[22px] font-black text-gray-900 leading-none">{todayStats.clicks}</p>
              <p className="text-[12px] font-semibold text-gray-500 mt-1">WhatsApp clicks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Status */}
      {(!user?.plan || user.plan === 'Free') ? (
        <div className="bg-[#FFFBEB] border border-amber-200 rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-sm">
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
        <div className="bg-[#ecfdf5] border border-[#059669]/30 rounded-2xl px-4 py-3.5 flex items-center shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-green-900">Pro plan</h3>
            <p className="text-[11px] font-semibold text-green-700 mt-0.5">
              Active until {user?.subscriptionRenewalDate || 'lifetime'}
            </p>
          </div>
        </div>
      )}

      {/* Product limit warning */}
      {(!user?.plan || user.plan === 'Free') && activeProductsCount >= 8 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3.5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-red-800">
              {activeProductsCount >= 10 ? 'Product limit reached' : 'Almost at your limit'}
            </p>
            <p className="text-[11px] text-red-600 mt-0.5">
              {activeProductsCount >= 10
                ? "You've used all 10 free product slots. Upgrade to add more."
                : `${activeProductsCount}/10 products used — only ${10 - activeProductsCount} slot${10 - activeProductsCount === 1 ? '' : 's'} left.`}
            </p>
          </div>
          <Link href="/settings?view=billing" className="text-xs font-bold bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors shrink-0 ml-3">
            Upgrade &rarr;
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 pt-3.5 pb-2 border-b border-gray-50">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Quick actions</p>
        </div>
        <div className="p-3 flex gap-2">
          <button
            onClick={openNewOrderModal}
            className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-500" /> Log Order
          </button>
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
          >
            <Share2 className="w-4 h-4 text-gray-500" /> Share Store
          </button>
          <Link
            href={`https://${user?.username}.myshoplink.site`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-500" /> View Store
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Recent orders</p>
          {orders.length > 0 && (
            <span className="text-[11px] font-semibold text-gray-400">{orders.length} total</span>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="py-10 flex flex-col items-center text-center gap-3">
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
          <div>
            <div className="flex items-center justify-between bg-[#F0FDF4] rounded-xl px-4 py-3 mb-3">
              <span className="text-sm text-gray-600">
                {orders.length} confirmed {orders.length === 1 ? 'sale' : 'sales'}
              </span>
              <span className="text-sm font-bold text-green-700">
                {currencySymbol}{orders.reduce((s, o) => s + o.revenue, 0).toFixed(2)}
              </span>
            </div>
            <RecentOrdersTable
              orders={orders.slice(0, 10)}
              products={products}
              currencySymbol={currencySymbol}
              onEditOrder={handleEditOrder}
              onDeleteOrder={handleDeleteOrder}
            />
          </div>
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

      {/* Pro upgrade celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="relative bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Confetti dots */}
              {[...Array(14)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2.5 h-2.5 rounded-full"
                  style={{
                    background: ['#059669','#fbbf24','#3b82f6','#f43f5e','#a855f7','#f97316'][i % 6],
                    left: `${8 + (i * 6.5) % 84}%`,
                    top: `${4 + (i * 11) % 35}%`,
                  }}
                  initial={{ opacity: 0, y: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], y: -50 - i * 5, scale: [0, 1.2, 0] }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 1.4, ease: 'easeOut' }}
                />
              ))}

              {/* Badge */}
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 16 }}
                className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center text-4xl"
                style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}
              >
                <span>⚡</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-xs font-black tracking-[0.2em] uppercase mb-1" style={{ color: '#059669' }}>
                  Pro Activated
                </p>
                <h2 className="text-2xl font-black text-gray-900 mb-2">You're on Pro! 🎉</h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  All Pro features are now unlocked. Time to grow your store.
                </p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={() => setShowCelebration(false)}
                className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-black active:scale-95 transition-transform"
              >
                Let's go →
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
