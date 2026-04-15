'use client';

import { useState, useEffect } from 'react';
import { Plus, Share2, Package, Store, Eye, MessageCircle, Check, X, ArrowUpRight, ExternalLink } from 'lucide-react';
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
  if (current === previous) return { direction: 'flat', percentage: '0%', label: 'vs yesterday' };
  if (previous === 0) return { direction: current > 0 ? 'up' : 'flat', percentage: current > 0 ? '100%' : '0%', label: 'vs yesterday' };
  const delta = ((current - previous) / previous) * 100;
  return {
    direction: delta > 0 ? 'up' : 'down',
    percentage: `${Math.abs(delta).toFixed(delta >= 10 || delta <= -10 ? 0 : 1)}%`,
    label: 'vs yesterday',
  };
}

// Shared section header style
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--app-text-muted)]">{children}</p>;
}

export function Dashboard() {
  const { products, analytics, orders, addOrder, updateOrder, deleteOrder, store, user, syncDashboard } = useStore();
  const [isLogOrderModalOpen, setIsLogOrderModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => { void syncDashboard(); }, 30_000);
    return () => clearInterval(interval);
  }, [syncDashboard]);

  useEffect(() => {
    if (searchParams.get('upgraded') === '1') {
      setShowCelebration(true);
      router.replace('/dashboard', { scroll: false });
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
  const yesterdayProductsCount = products.filter(p => p.createdAt < `${todayStr}T00:00:00.000Z`).length;
  const isTrialPro = user?.plan === 'Pro' && !user?.razorpaySubscriptionId;

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const confirmedOrders = orders.filter(o => isRealSale(o.status));
  const totalRevenue = confirmedOrders.reduce((s, o) => s + o.revenue, 0);

  const checklistItems = [
    { label: 'Add your first product', done: activeProductsCount > 0, actionLabel: 'Add product', href: '/products' },
    { label: 'Customize store details', done: Boolean(store.logoUrl || (store.bio?.trim()) || (store.tagline && store.tagline !== 'Your WhatsApp storefront is ready to launch.')), actionLabel: 'Edit store', href: '/settings?view=store' },
    { label: 'Share your store and get your first visit', done: analytics.totalViews > 0, actionLabel: 'Share store' },
  ];
  const remainingChecklistCount = checklistItems.filter(i => !i.done).length;

  const handleSaveOrder = (newOrder: { productId: string; quantity: number; revenue: number; notes: string; internalNotes: string; date: string }) => {
    if (selectedOrder) updateOrder(selectedOrder.id, newOrder);
    else addOrder({ ...newOrder, status: 'confirmed' });
    setIsLogOrderModalOpen(false);
    setSelectedOrder(null);
  };

  const handleEditOrder = (order: Order) => { setSelectedOrder(order); setIsLogOrderModalOpen(true); };
  const handleDeleteOrder = (order: Order) => { if (window.confirm('Delete this order?')) deleteOrder(order.id); };
  const openNewOrderModal = () => { setSelectedOrder(null); setIsLogOrderModalOpen(true); };

  return (
    <div className="w-full space-y-6 pb-8">

      {/* ── Greeting ── */}
      <div className="flex items-start justify-between gap-4 rounded-2xl border bg-[var(--app-panel)] px-5 py-5 shadow-[0_1px_0_rgba(0,0,0,0.03)]" style={{ borderColor: 'var(--app-border)' }}>
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-[var(--app-text)]">
            Hello, {user?.firstName || 'there'} 👋
          </h1>
          <p className="mt-1 text-sm text-[var(--app-text-muted)]">Here&apos;s what&apos;s happening with your store today.</p>
        </div>
        {/* Plan pill */}
        {user?.plan === 'Free' ? (
          <Link href="/settings?view=billing"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold text-[#795f1a] transition-colors hover:bg-[#efe5d2]"
            style={{ borderColor: '#dfd0aa', background: '#f5efe1' }}>
            Free plan · Upgrade →
          </Link>
        ) : (
          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold text-emerald-700" style={{ borderColor: '#c5d8c8', background: '#e8f2eb' }}>
            {isTrialPro ? 'Pro trial' : 'Pro'} ✓
          </span>
        )}
      </div>

      {/* ── Today's snapshot ── */}
      <div>
        <SectionLabel>Today's snapshot</SectionLabel>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          <SnapshotCard icon={<Package style={{ color: '#f59e0b', width: 16, height: 16 }} />} accentColor="#f59e0b" value={todayOrdersCount} label="Orders today" trend={getTrend(todayOrdersCount, yesterdayOrdersCount)} />
          <SnapshotCard icon={<Eye style={{ color: '#3b82f6', width: 16, height: 16 }} />} accentColor="#3b82f6" value={todayStats.views} label="Store views" trend={getTrend(todayStats.views, yesterdayStats.views)} />
          <SnapshotCard icon={<MessageCircle style={{ color: '#059669', width: 16, height: 16 }} />} accentColor="#059669" value={todayStats.clicks} label="WhatsApp clicks" trend={getTrend(todayStats.clicks, yesterdayStats.clicks)} />
          <SnapshotCard icon={<Store style={{ color: '#8b5cf6', width: 16, height: 16 }} />} accentColor="#8b5cf6" value={activeProductsCount} label="Active products" trend={getTrend(activeProductsCount, yesterdayProductsCount)} />
          <SnapshotCard icon={<Check style={{ color: '#f97316', width: 16, height: 16 }} />} accentColor="#f97316" value={pendingOrders.length} label="Pending orders" trend={getTrend(pendingOrders.filter(o => o.date.startsWith(todayStr)).length, orders.filter(o => o.status === 'pending' && o.date.startsWith(yesterdayStr)).length)} />
          <SnapshotCard icon={<ArrowUpRight style={{ color: '#10b981', width: 16, height: 16 }} />} accentColor="#10b981" value={totalRevenue} prefix={currencySymbol} label="Total revenue" trend={getTrend(orders.filter(o => isRealSale(o.status) && o.date.startsWith(todayStr)).reduce((s, o) => s + o.revenue, 0), orders.filter(o => isRealSale(o.status) && o.date.startsWith(yesterdayStr)).reduce((s, o) => s + o.revenue, 0))} />
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="rounded-2xl border bg-[var(--app-panel)] p-5 shadow-[0_1px_0_rgba(0,0,0,0.03)]" style={{ borderColor: 'var(--app-border)' }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--app-text)]">Quick actions</p>
            <p className="mt-0.5 text-xs text-[var(--app-text-muted)]">Jump into the most common tasks.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={openNewOrderModal}
              className="inline-flex h-9 items-center gap-2 rounded-xl border bg-[var(--app-panel-muted)] px-3.5 text-sm font-medium text-[var(--app-text)] transition-colors hover:bg-[#ece9e4]" style={{ borderColor: 'var(--app-border)' }}>
              <Plus className="w-4 h-4" /> Add Order
            </button>
            <button onClick={() => setIsShareModalOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-xl border bg-[var(--app-panel-muted)] px-3.5 text-sm font-medium text-[var(--app-text)] transition-colors hover:bg-[#ece9e4]" style={{ borderColor: 'var(--app-border)' }}>
              <Share2 className="w-4 h-4" /> Share Store
            </button>
            {user?.username && (
              <a href={getStoreUrl(user.username)} target="_blank" rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-xl border bg-[var(--app-panel-muted)] px-3.5 text-sm font-medium text-[var(--app-text)] transition-colors hover:bg-[#ece9e4]" style={{ borderColor: 'var(--app-border)' }}>
                <ExternalLink className="w-4 h-4" /> View Store
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Product limit warning ── */}
      {(!user?.plan || user.plan === 'Free') && activeProductsCount >= 8 && (
        <div className="flex items-start justify-between gap-4 rounded-2xl border px-4 py-3.5" style={{ borderColor: '#e9c7c4', background: '#f8eceb' }}>
          <div>
            <p className="text-sm font-semibold text-red-800">
              {activeProductsCount >= 10 ? 'Product limit reached' : 'Almost at your limit'}
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {activeProductsCount >= 10
                ? "You've used all 10 free slots. Upgrade to add more."
                : `${activeProductsCount}/10 products used — ${10 - activeProductsCount} slot${10 - activeProductsCount === 1 ? '' : 's'} left.`}
            </p>
          </div>
          <Link href="/settings?view=billing"
            className="shrink-0 inline-flex h-8 items-center rounded-lg bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700 transition-colors">
            Upgrade
          </Link>
        </div>
      )}

      {/* ── Setup checklist ── */}
      {remainingChecklistCount > 0 && (
        <div className="overflow-hidden rounded-2xl border bg-[var(--app-panel)] shadow-[0_1px_0_rgba(0,0,0,0.03)]" style={{ borderColor: 'var(--app-border)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--app-border)' }}>
            <p className="text-sm font-semibold text-[var(--app-text)]">Get your store ready</p>
            <span className="text-xs font-medium text-[var(--app-text-muted)]">
              {checklistItems.length - remainingChecklistCount}/{checklistItems.length} done
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--app-border)' }}>
            {checklistItems.map((item, idx) => (
              <div key={item.label} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${item.done ? 'bg-emerald-100 text-emerald-700' : 'bg-[var(--app-panel-muted)] text-[var(--app-text-muted)]'}`}>
                    {item.done ? '✓' : idx + 1}
                  </div>
                  <p className={`text-sm ${item.done ? 'text-zinc-400 line-through' : 'text-[var(--app-text)]'}`}>{item.label}</p>
                </div>
                {!item.done && (
                  item.href
                    ? <Link href={item.href} className="shrink-0 text-xs font-semibold text-emerald-700 hover:text-emerald-800">{item.actionLabel} →</Link>
                    : <button type="button" onClick={() => setIsShareModalOpen(true)} className="shrink-0 text-xs font-semibold text-emerald-700 hover:text-emerald-800">{item.actionLabel} →</button>
                )}
                {item.done && <span className="shrink-0 text-xs font-medium text-emerald-600">Done</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Pending orders ── */}
      {pendingOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <SectionLabel>Pending orders</SectionLabel>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              {pendingOrders.length} new
            </span>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {pendingOrders.map((order) => {
              const product = products.find(p => p.id === order.productId);
              const lead = parseOrderLeadNotes(order.notes);
              return (
                <div key={order.id} className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                  <div className="flex items-start gap-3 p-3.5">
                    <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-zinc-100">
                      {product?.imageUrl
                        ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-zinc-100" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-zinc-900 line-clamp-1">{product?.name || 'Unknown product'}</p>
                        <span className="shrink-0 rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">Pending</span>
                      </div>
                      <p className="mt-0.5 text-sm font-semibold text-zinc-900">
                        {currencySymbol}{order.revenue.toFixed(2)}
                        <span className="ml-1 text-xs font-normal text-zinc-400">× {order.quantity}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-600">
                        {lead.details.customerName || 'No name'}
                        {lead.details.customerPhone && <span className="text-zinc-400"> · {lead.details.customerPhone}</span>}
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        {formatPaymentMethodLabel(lead.details.paymentMethod) || '—'} · {format(new Date(order.date), 'MMM d, h:mm a')}
                      </p>
                      {lead.details.address && (
                        <p className="mt-0.5 text-[11px] text-zinc-400 leading-snug">
                          📍 {lead.details.address}{lead.details.pincode ? ` — ${lead.details.pincode}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex border-t border-zinc-100">
                    <button onClick={() => updateOrder(order.id, { status: 'declined' })}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors border-r border-zinc-100">
                      <X className="w-3.5 h-3.5" /> Decline
                    </button>
                    <button onClick={() => updateOrder(order.id, { status: 'confirmed' })}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors">
                      <Check className="w-3.5 h-3.5" /> Confirm
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block rounded-2xl border bg-[var(--app-panel)] overflow-hidden" style={{ borderColor: 'var(--app-border)' }}>
            <table className="min-w-[860px] w-full text-sm">
              <thead>
                <tr className="border-b bg-[var(--app-panel-muted)]" style={{ borderColor: 'var(--app-border)' }}>
                  {['Product', 'Qty', 'Status', 'Customer', 'Payment', 'Shipping', 'Actions'].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400 ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--app-border)' }}>
                {pendingOrders.map((order) => {
                  const product = products.find(p => p.id === order.productId);
                  const lead = parseOrderLeadNotes(order.notes);
                  return (
                    <tr key={order.id} className="transition-colors hover:bg-[var(--app-panel-muted)]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product?.imageUrl
                            ? <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-cover border border-zinc-100 shrink-0" />
                            : <div className="w-10 h-10 rounded-lg bg-zinc-100 shrink-0" />}
                          <div className="min-w-0">
                            <p className="font-medium text-zinc-900 truncate">{product?.name || 'Unknown'}</p>
                            <p className="text-xs text-zinc-400">{currencySymbol}{order.revenue.toFixed(2)} · {format(new Date(order.date), 'MMM d, h:mm a')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-zinc-700">{order.quantity}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Pending</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-800">{lead.details.customerName || '—'}</p>
                        <p className="text-xs text-zinc-400">{lead.details.customerPhone || ''}</p>
                      </td>
                      <td className="px-4 py-3 text-zinc-600 text-xs">{formatPaymentMethodLabel(lead.details.paymentMethod) || '—'}</td>
                      <td className="px-4 py-3 text-xs text-zinc-600 max-w-[160px]">
                        {lead.details.address
                          ? <><p className="leading-snug">{lead.details.address}</p><p className="text-zinc-400">{[lead.details.city, lead.details.pincode].filter(Boolean).join(' — ')}</p></>
                          : <span className="text-zinc-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => updateOrder(order.id, { status: 'declined' })}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors">
                            <X className="w-3.5 h-3.5" /> Decline
                          </button>
                          <button onClick={() => updateOrder(order.id, { status: 'confirmed' })}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors">
                            <Check className="w-3.5 h-3.5" /> Confirm
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

      {/* ── Confirmed orders ── */}
      <div className="overflow-hidden rounded-2xl border bg-[var(--app-panel)] shadow-[0_1px_0_rgba(0,0,0,0.03)]" style={{ borderColor: 'var(--app-border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--app-border)' }}>
          <p className="text-sm font-semibold text-[var(--app-text)]">Recent orders</p>
          {confirmedOrders.length > 0 && (
            <span className="text-xs font-medium text-[var(--app-text-muted)]">{confirmedOrders.length} total</span>
          )}
        </div>
        <div className="p-5">
          {confirmedOrders.length === 0 ? (
            <div className="py-10 flex flex-col items-center text-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--app-panel-muted)]">
                <Package className="w-6 h-6 text-zinc-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-700">No confirmed orders yet</p>
                <p className="text-xs text-zinc-400 mt-0.5">Confirmed orders will appear here.</p>
              </div>
              <button onClick={openNewOrderModal}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors">
                <Plus className="w-4 h-4" /> Add Order Manually
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between rounded-2xl border px-4 py-3" style={{ borderColor: '#c5d8c8', background: '#e8f2eb' }}>
                <span className="text-sm text-[var(--app-text-muted)]">{confirmedOrders.length} confirmed {confirmedOrders.length === 1 ? 'sale' : 'sales'}</span>
                <span className="text-sm font-bold text-emerald-700">{currencySymbol}{confirmedOrders.reduce((s, o) => s + o.revenue, 0).toFixed(2)}</span>
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

      <LogOrderModal isOpen={isLogOrderModalOpen} onClose={() => { setIsLogOrderModalOpen(false); setSelectedOrder(null); }} products={products} currencySymbol={currencySymbol} todayStr={todayStr} onSave={handleSaveOrder} initialData={selectedOrder} />
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} username={user?.username || ''} />

      {/* Pro upgrade celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={() => setShowCelebration(false)}>
            <motion.div initial={{ scale: 0.85, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="relative bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}>
              {[...Array(14)].map((_, i) => (
                <motion.div key={i} className="absolute w-2.5 h-2.5 rounded-full"
                  style={{ background: ['#059669','#fbbf24','#3b82f6','#f43f5e','#a855f7','#f97316'][i % 6], left: `${8 + (i * 6.5) % 84}%`, top: `${4 + (i * 11) % 35}%` }}
                  initial={{ opacity: 0, y: 0, scale: 0 }} animate={{ opacity: [0, 1, 0], y: -50 - i * 5, scale: [0, 1.2, 0] }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 1.4, ease: 'easeOut' }} />
              ))}
              <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 16 }}
                className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center text-3xl"
                style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
                <span>⚡</span>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <p className="text-xs font-bold tracking-widest uppercase text-emerald-600 mb-1">Pro Activated</p>
                <h2 className="text-xl font-bold text-zinc-900 mb-2">You're on Pro! 🎉</h2>
                <p className="text-sm text-zinc-500 leading-relaxed mb-6">All Pro features are now unlocked. Time to grow your store.</p>
              </motion.div>
              <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                onClick={() => setShowCelebration(false)}
                className="w-full py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors">
                Let's go →
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
