'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, ShoppingBag, TrendingUp, Users, Package } from 'lucide-react';
import { Order, Product } from '../../types';
import { formatPaymentMethodLabel, parseOrderLeadNotes } from '../../utils/orderLeads';

const PAGE_SIZE = 10;

interface RecentOrdersTableProps {
  orders: Order[];
  products: Product[];
  currencySymbol: string;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (order: Order) => void;
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === 'confirmed' || status === 'paid'
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      : status === 'declined'
        ? 'bg-red-50 text-red-600 border border-red-200'
        : status === 'payment_failed'
        ? 'bg-red-50 text-red-600 border border-red-200'
        : status === 'payment_pending_verification'
          ? 'bg-violet-50 text-violet-700 border border-violet-200'
          : status === 'checkout_pending'
            ? 'bg-sky-50 text-sky-700 border border-sky-200'
          : 'bg-amber-50 text-amber-700 border border-amber-200';
  const label =
    status === 'payment_pending_verification'
      ? 'Payment sent'
      : status === 'checkout_pending'
        ? 'Checkout started'
        : status === 'payment_failed'
          ? 'Payment failed'
          : status;
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ${styles}`}>
      {label}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';
  return (
    <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-[11px] font-bold shrink-0">
      {initials}
    </div>
  );
}

export function RecentOrdersTable({ orders, products, currencySymbol, onEditOrder }: RecentOrdersTableProps) {
  const [page, setPage] = useState(1);

  const sorted = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalRevenue = orders.reduce((s, o) => s + o.revenue, 0);
  const uniqueCustomers = new Set(
    orders.map(o => parseOrderLeadNotes(o.notes).details.customerPhone).filter(Boolean)
  ).size;

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-xl bg-zinc-50 flex items-center justify-center mb-3">
          <ShoppingBag className="w-7 h-7 text-zinc-300" />
        </div>
        <p className="text-sm font-semibold text-zinc-500">No sales recorded yet</p>
        <p className="text-xs text-zinc-400 mt-1">Confirmed orders will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* CRM stat bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Orders</span>
          </div>
          <p className="text-xl font-black text-zinc-900">{orders.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Revenue</span>
          </div>
          <p className="text-xl font-black text-emerald-700">{currencySymbol}{totalRevenue.toFixed(0)}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Customers</span>
          </div>
          <p className="text-xl font-black text-zinc-900">{uniqueCustomers}</p>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {paginated.map((order) => {
          const product = products.find((p) => p.id === order.productId);
          const lead = parseOrderLeadNotes(order.notes);
          const customerName = lead.details.customerName || 'Unknown customer';
          return (
            <button
              key={order.id}
              type="button"
              onClick={() => onEditOrder(order)}
              className="w-full rounded-xl border border-zinc-200 bg-white overflow-hidden text-left hover:border-zinc-300 transition-colors"
            >
              {/* Card header */}
              <div className="flex items-center gap-3 px-3 py-2.5 border-b border-zinc-100">
                <Avatar name={customerName} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 truncate">{customerName}</p>
                  <p className="text-[11px] text-zinc-400">{lead.details.customerPhone || 'No phone'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-emerald-700">{currencySymbol}{order.revenue.toFixed(2)}</p>
                  <p className="text-[11px] text-zinc-400">× {order.quantity}</p>
                </div>
              </div>
              {/* Card body */}
              <div className="flex items-center gap-3 px-3 py-2">
                {product?.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-9 h-9 rounded-lg object-cover border border-zinc-100 shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-zinc-100 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-700 truncate">{product?.name || 'Unknown product'}</p>
                  <p className="text-[11px] text-zinc-400">{formatPaymentMethodLabel(lead.details.paymentMethod) || 'Payment N/A'}</p>
                  {lead.details.address && (
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                      📍 {lead.details.address}{lead.details.pincode ? ` — ${lead.details.pincode}` : ''}
                    </p>
                  )}
                  {lead.details.email && (
                    <p className="text-[11px] text-zinc-400">✉ {lead.details.email}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <StatusBadge status={order.status} />
                  <p className="text-[11px] text-zinc-400">{format(new Date(order.date), 'MMM d, h:mm a')}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Desktop CRM table */}
      <div className="hidden md:block rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Customer</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Product</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Contact</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Payment</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Shipping</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Qty</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Status</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Revenue</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {paginated.map((order) => {
              const product = products.find(p => p.id === order.productId);
              const lead = parseOrderLeadNotes(order.notes);
              const customerName = lead.details.customerName || 'Unknown';
              return (
                <tr
                  key={order.id}
                  className="hover:bg-zinc-50 transition-colors cursor-pointer"
                  onClick={() => onEditOrder(order)}
                >
                  {/* Customer */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={customerName} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 truncate max-w-[120px]">{customerName}</p>
                      </div>
                    </div>
                  </td>
                  {/* Product */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {product?.imageUrl && (
                        <img src={product.imageUrl} alt={product.name} className="w-8 h-8 rounded-lg object-cover border border-zinc-100 shrink-0" />
                      )}
                      <span className="text-sm text-zinc-700 truncate max-w-[120px]">{product?.name || '—'}</span>
                    </div>
                  </td>
                  {/* Contact */}
                  <td className="px-4 py-3 text-sm text-zinc-600">
                    <div>
                      <p className="whitespace-nowrap">{lead.details.customerPhone || <span className="text-zinc-300">—</span>}</p>
                      {lead.details.email && (
                        <p className="text-[11px] text-zinc-400 mt-0.5">{lead.details.email}</p>
                      )}
                    </div>
                  </td>
                  {/* Payment */}
                  <td className="px-4 py-3 text-sm text-zinc-600 whitespace-nowrap">
                    {formatPaymentMethodLabel(lead.details.paymentMethod) || <span className="text-zinc-300">—</span>}
                  </td>
                  {/* Shipping */}
                  <td className="px-4 py-3 text-sm text-zinc-600 max-w-[180px]">
                    {lead.details.address ? (
                      <div>
                        <p className="leading-snug">{lead.details.address}</p>
                        {(lead.details.pincode || lead.details.city) && (
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            {[lead.details.city, lead.details.pincode].filter(Boolean).join(' — ')}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </td>
                  {/* Qty */}
                  <td className="px-4 py-3 text-center text-sm font-medium text-zinc-700">{order.quantity}</td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  {/* Revenue */}
                  <td className="px-4 py-3 text-right text-sm font-bold text-emerald-700 whitespace-nowrap">
                    {currencySymbol}{order.revenue.toFixed(2)}
                  </td>
                  {/* Date */}
                  <td className="px-4 py-3 text-right text-xs text-zinc-400 whitespace-nowrap">
                    {format(new Date(order.date), 'MMM d, h:mm a')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination inside table card */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 bg-zinc-50">
            <span className="text-xs text-zinc-400">
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, sorted.length)} of {sorted.length} orders
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-zinc-500 px-2">{currentPage} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-40 transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between md:hidden pt-1">
          <span className="text-xs text-zinc-400">
            {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40 transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-zinc-500 px-1">{currentPage}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40 transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
