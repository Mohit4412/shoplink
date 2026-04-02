'use client';

import { useState, useEffect } from 'react';
import { Plus, Share2, Package, Store, Eye, MessageCircle, Check, X, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { format, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '../context/StoreContext';
import { getCurrencySymbol } from '../utils/currency';
import { Order } from '../types';
import { Button } from '../components/ui/Button';
import { LogOrderModal } from '../components/dashboard/LogOrderModal';
import { ShareModal } from '../components/dashboard/ShareModal';
import { RecentOrdersTable } from '../components/dashboard/RecentOrdersTable';
import { SnapshotCard, Trend } from '../components/dashboard/SnapshotCard';
import { formatPaymentMethodLabel, parseOrderLeadNotes } from '../utils/orderLeads';
import { getStoreUrl } from '../utils/storeUrl';

function getTrend(current: number, previous: number): Trend {
  if (current === previous) {
    return {
      direction: 'flat',
      percentage: '0%',
      label: 'vs yesterday',
    };
  }

  if (previous === 0) {
    return {
      direction: current > 0 ? 'up' : 'flat',
      percentage: current > 0 ? '100%' : '0%',
      label: 'vs yesterday',
    };
  }

  const delta = ((current - previous) / previous) * 100;
  return {
    direction: delta > 0 ? 'up' : 'down',
    percentage: `${Math.abs(delta).toFixed(delta >= 10 || delta <= -10 ? 0 : 1)}%`,
    label: 'vs yesterday',
  };
}

export function Dashboard() {
  const { products, analytics, orders, addOrder, updateOrder, deleteOrder, store, user, syncDashboard } = useStore();
  const [isLogOrderModalOpen, setIsLogOrderModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showCelebration, setShowCelebration] = useState(false);

  // Poll for new pending orders every 30s while dashboard is open
  useEffect(() => {
    const interval = setInterval(() => { void syncDashboard(); }, 30_000);
    return () => clearInterval(interval);
  }, [syncDashboard]);

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
  const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
  const currencySymbol = getCurrencySymbol(store.currency);
  const isRealSale = (status: string) => status === 'confirmed' || status === 'paid';

  const todayOrdersCount = orders.filter(o => isRealSale(o.status) && o.date.startsWith(todayStr)).length;
  const yesterdayOrdersCount = orders.filter(o => isRealSale(o.status) && o.date.startsWith(yesterdayStr)).length;
  const todayStats = analytics.dailyStats.find(s => s.fullDate === todayStr) || { views: 0, clicks: 0, orders: 0 };
  const yesterdayStats = analytics.dailyStats.find(s => s.fullDate === yesterdayStr) || { views: 0, clicks: 0, orders: 0 };
  const activeProductsCount = products.length;
  const yesterdayProductsCount = products.filter(product => product.createdAt < `${todayStr}T00:00:00.000Z`).length;
  const isTrialPro = user?.plan === 'Pro' && !user?.razorpaySubscriptionId;

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const confirmedOrders = orders.filter(o => isRealSale(o.status));
  const totalRevenue = confirmedOrders.reduce((sum, order) => sum + order.revenue, 0);
  const orderTrend = getTrend(todayOrdersCount, yesterdayOrdersCount);
  const viewsTrend = getTrend(todayStats.views, yesterdayStats.views);
  const productsTrend = getTrend(activeProductsCount, yesterdayProductsCount);
  const clicksTrend = getTrend(todayStats.clicks, yesterdayStats.clicks);
  const pendingOrdersTrend = getTrend(
    pendingOrders.filter((order) => order.date.startsWith(todayStr)).length,
    orders.filter((order) => order.status === 'pending' && order.date.startsWith(yesterdayStr)).length
  );
  const revenueTrend = getTrend(
    orders
      .filter((order) => isRealSale(order.status) && order.date.startsWith(todayStr))
      .reduce((sum, order) => sum + order.revenue, 0),
    orders
      .filter((order) => isRealSale(order.status) && order.date.startsWith(yesterdayStr))
      .reduce((sum, order) => sum + order.revenue, 0)
  );
  const checklistItems = [
    {
      label: 'Add your first product',
      done: activeProductsCount > 0,
      actionLabel: 'Add product',
      href: '/products',
    },
    {
      label: 'Customize store details',
      done: Boolean(store.logoUrl || (store.bio && store.bio.trim()) || (store.tagline && store.tagline !== 'Your WhatsApp storefront is ready to launch.')),
      actionLabel: 'Edit store',
      href: '/settings?view=store',
    },
    {
      label: 'Share your store and get your first visit',
      done: analytics.totalViews > 0,
      actionLabel: 'Share store',
    },
  ];
  const remainingChecklistCount = checklistItems.filter((item) => !item.done).length;

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
    <div className="w-full space-y-4 pb-6">
      {/* Greeting */}
      <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl px-5 py-4">
        <h1 className="text-[22px] font-bold text-gray-900 leading-tight">
          Hello {user?.firstName || 'there'} <span className="inline-block animate-wave">👋</span>
        </h1>
        <p className="text-[14px] text-gray-500 font-medium mt-1">Here&apos;s your store activity today.</p>
      </div>

      {/* Today's Metrics */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Today's snapshot</p>
        <div className="grid grid-cols-2 gap-3 sm:gap-3 xl:grid-cols-3">
          <SnapshotCard
            icon={<Package className="w-4.5 h-4.5" style={{ color: '#f59e0b', width: 18, height: 18 }} />}
            accentColor="#f59e0b"
            accentBg="#fffbeb"
            value={todayOrdersCount}
            label="Orders today"
            trend={orderTrend}
          />
          <SnapshotCard
            icon={<Eye style={{ color: '#3b82f6', width: 18, height: 18 }} />}
            accentColor="#3b82f6"
            accentBg="#eff6ff"
            value={todayStats.views}
            label="Store views"
            trend={viewsTrend}
          />
          <SnapshotCard
            icon={<MessageCircle style={{ color: '#059669', width: 18, height: 18 }} />}
            accentColor="#059669"
            accentBg="#ecfdf5"
            value={todayStats.clicks}
            label="WhatsApp clicks"
            trend={clicksTrend}
          />
          <SnapshotCard
            icon={<Store style={{ color: '#8b5cf6', width: 18, height: 18 }} />}
            accentColor="#8b5cf6"
            accentBg="#f5f3ff"
            value={activeProductsCount}
            label="Active products"
            trend={productsTrend}
          />
          <SnapshotCard
            icon={<Check style={{ color: '#f97316', width: 18, height: 18 }} />}
            accentColor="#f97316"
            accentBg="#fff7ed"
            value={pendingOrders.length}
            label="Pending orders"
            trend={pendingOrdersTrend}
          />
          <SnapshotCard
            icon={<ArrowUpRight style={{ color: '#10b981', width: 18, height: 18 }} />}
            accentColor="#10b981"
            accentBg="#ecfdf5"
            value={totalRevenue}
            prefix={currencySymbol}
            label="Total revenue"
            trend={revenueTrend}
          />
        </div>
      </div>

      <div className="space-y-4">
          {/* Plan Status */}
          {(!user?.plan || user.plan === 'Free') ? (
            <div className="bg-[#FFFBEB] border border-amber-200 rounded-2xl px-4 py-4 flex flex-col items-start justify-between gap-3 shadow-sm sm:flex-row sm:items-center">
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
            <div className="bg-[#ecfdf5] border border-[#059669]/30 rounded-2xl px-4 py-4 flex items-center shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-green-900">{isTrialPro ? 'Pro trial' : 'Pro plan'}</h3>
                <p className="text-[11px] font-semibold text-green-700 mt-0.5">
                  {isTrialPro ? 'Trial ends' : 'Active until'} {user?.subscriptionRenewalDate || 'lifetime'}
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Quick actions</p>
                <p className="mt-1 text-sm text-gray-500">Jump into the most common seller tasks.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <button
                  onClick={openNewOrderModal}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-50 px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 sm:w-auto"
                >
                  <Plus className="w-4 h-4 text-gray-500" /> Add Order Manually
                </button>
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-50 px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 sm:w-auto"
                >
                  <Share2 className="w-4 h-4 text-gray-500" /> Share Store
                </button>
                <Link
                  href={user?.username ? getStoreUrl(user.username) : '/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-50 px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 sm:w-auto"
                >
                  <Eye className="w-4 h-4 text-gray-500" /> View Store
                </Link>
              </div>
            </div>
          </div>

          {/* Product limit warning */}
          {(!user?.plan || user.plan === 'Free') && activeProductsCount >= 8 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
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
              <Link href="/settings?view=billing" className="text-xs font-bold bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors shrink-0">
                Upgrade &rarr;
              </Link>
            </div>
          )}

          {remainingChecklistCount > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 pt-3.5 pb-2 border-b border-gray-50 flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Get store ready</p>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {checklistItems.length - remainingChecklistCount}/{checklistItems.length} done
                </span>
              </div>
              <div className="p-4 space-y-3">
                {checklistItems.map((item) => (
                  <div key={item.label} className="flex flex-col gap-3 rounded-xl border border-gray-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${item.done ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {item.done ? '✓' : checklistItems.findIndex((entry) => entry.label === item.label) + 1}
                      </div>
                      <p className={`text-sm font-medium ${item.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{item.label}</p>
                    </div>
                    {!item.done && item.href ? (
                      <Link href={item.href} className="shrink-0 text-xs font-bold text-emerald-700 hover:text-emerald-800">
                        {item.actionLabel} →
                      </Link>
                    ) : !item.done ? (
                      <button
                        type="button"
                        onClick={() => setIsShareModalOpen(true)}
                        className="shrink-0 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                      >
                        {item.actionLabel} →
                      </button>
                    ) : (
                      <span className="shrink-0 text-xs font-semibold text-emerald-700">Done</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Pending Orders — needs action */}
      {pendingOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Pending orders</p>
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{pendingOrders.length} new</span>
          </div>
          <div className="space-y-3 md:hidden">
            {pendingOrders.map((order) => {
              const product = products.find(p => p.id === order.productId);
              const lead = parseOrderLeadNotes(order.notes);

              return (
                <div key={order.id} className="rounded-2xl border border-amber-200 bg-white overflow-hidden shadow-sm">
                  {/* Top: image + info */}
                  <div className="flex items-start gap-3 p-3">
                    {/* Image */}
                    <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-amber-50">
                      {product?.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-amber-100" />
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                          {product?.name || 'Unknown product'}
                        </p>
                        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                          Pending
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-gray-800">
                        {currencySymbol}{order.revenue.toFixed(2)}
                        <span className="ml-1.5 text-xs font-normal text-gray-400">× {order.quantity}</span>
                      </p>
                      <p className="mt-1 text-xs font-medium text-gray-700">
                        {lead.details.customerName || 'No name'}
                        {lead.details.customerPhone && (
                          <span className="font-normal text-gray-400"> · {lead.details.customerPhone}</span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-400">
                        {formatPaymentMethodLabel(lead.details.paymentMethod) || 'Payment not specified'}
                        {' · '}{format(new Date(order.date), 'MMM d, h:mm a')}
                      </p>
                      {(lead.details.address || lead.details.email) && (
                        <div className="mt-1.5 space-y-0.5">
                          {lead.details.address && (
                            <p className="text-[11px] text-gray-500 leading-snug">
                              📍 {lead.details.address}{lead.details.pincode ? ` — ${lead.details.pincode}` : ''}
                            </p>
                          )}
                          {lead.details.email && (
                            <p className="text-[11px] text-gray-400">✉ {lead.details.email}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Bottom: actions */}
                  <div className="flex border-t border-amber-100">
                    <button
                      onClick={() => updateOrder(order.id, { status: 'declined' })}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors border-r border-amber-100"
                    >
                      <X className="w-3.5 h-3.5" />
                      Decline
                    </button>
                    <button
                      onClick={() => updateOrder(order.id, { status: 'confirmed' })}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-green-700 hover:bg-green-50 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Confirm
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="hidden overflow-x-auto rounded-2xl border border-amber-200 bg-white shadow-sm md:block">
            <table className="min-w-[860px] w-full text-sm">
              <thead>
                <tr className="border-b border-amber-100 bg-amber-50/60">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-500">Product</th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-widest text-gray-500">Qty</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-500">Phone</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-500">Payment</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-500">Shipping</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-widest text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map((order) => {
                  const product = products.find(p => p.id === order.productId);
                  const lead = parseOrderLeadNotes(order.notes);

                  return (
                    <tr key={order.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {product?.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-11 h-11 rounded-xl object-cover border border-gray-100 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-gray-100 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{product?.name || 'Unknown product'}</p>
                            <p className="text-xs text-gray-500">
                              {currencySymbol}{order.revenue.toFixed(2)} · {format(new Date(order.date), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-700">{order.quantity}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-700">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {lead.details.customerName || 'Not provided'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div>
                          <p>{lead.details.customerPhone || 'Not provided'}</p>
                          {lead.details.email && (
                            <p className="text-[11px] text-gray-400 mt-0.5">{lead.details.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatPaymentMethodLabel(lead.details.paymentMethod) || 'Not provided'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-[180px]">
                        {lead.details.address ? (
                          <div>
                            <p className="leading-snug">{lead.details.address}</p>
                            {(lead.details.pincode || lead.details.city) && (
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                {[lead.details.city, lead.details.pincode].filter(Boolean).join(' — ')}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => updateOrder(order.id, { status: 'declined' })}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
                            title="Decline"
                          >
                            <X className="w-3.5 h-3.5" />
                            Decline
                          </button>
                          <button
                            onClick={() => updateOrder(order.id, { status: 'confirmed' })}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-green-700 hover:bg-green-100 transition-colors"
                            title="Confirm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Confirm
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmed Orders */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 pt-3.5 pb-2 border-b border-gray-50 flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Recent orders</p>
          {confirmedOrders.length > 0 && (
            <span className="text-[11px] font-semibold text-gray-400">{confirmedOrders.length} total</span>
          )}
        </div>

        <div className="p-4">
          {confirmedOrders.length === 0 ? (
            <div className="py-10 flex flex-col items-center text-center gap-3">
              <Package className="w-8 h-8 text-gray-300" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">No confirmed orders yet</h3>
                <p className="text-xs text-gray-400 mt-1">Confirmed orders will appear here.</p>
              </div>
              <Button onClick={openNewOrderModal}>
                <Plus className="w-4 h-4 mr-2" />
                Add Order Manually
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-2 rounded-xl bg-[#F0FDF4] px-4 py-3 mb-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-gray-600">
                  {confirmedOrders.length} confirmed {confirmedOrders.length === 1 ? 'sale' : 'sales'}
                </span>
                <span className="text-sm font-bold text-green-700">
                  {currencySymbol}{confirmedOrders.reduce((s, o) => s + o.revenue, 0).toFixed(2)}
                </span>
              </div>
              <RecentOrdersTable
                orders={confirmedOrders.slice(0, 10)}
                products={products}
                currencySymbol={currencySymbol}
                onEditOrder={handleEditOrder}
                onDeleteOrder={handleDeleteOrder}
              />
            </div>
          )}
        </div>
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
