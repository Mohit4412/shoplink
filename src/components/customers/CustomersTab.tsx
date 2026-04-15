'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Search, Users, TrendingUp, ShoppingBag, Phone, Mail, MapPin } from 'lucide-react';
import { Order } from '../../types';
import { parseOrderLeadNotes } from '../../utils/orderLeads';

interface CustomersTabProps {
  orders: Order[];
  currencySymbol: string;
}

interface Customer {
  phone: string;
  name: string;
  email: string;
  city: string;
  orderCount: number;
  totalSpend: number;
  lastOrderDate: string;
}

function deriveCustomers(orders: Order[]): Customer[] {
  const confirmed = orders.filter(o => o.status === 'confirmed' || o.status === 'paid');
  const map = new Map<string, Customer>();

  for (const order of confirmed) {
    const lead = parseOrderLeadNotes(order.notes);
    const phone = lead.details.customerPhone?.trim() || 'unknown';
    const existing = map.get(phone);

    if (existing) {
      existing.orderCount += 1;
      existing.totalSpend += order.revenue;
      if (order.date > existing.lastOrderDate) {
        existing.lastOrderDate = order.date;
        // Update name/email/city if newer order has them
        if (lead.details.customerName) existing.name = lead.details.customerName;
        if (lead.details.email) existing.email = lead.details.email;
        if (lead.details.city) existing.city = lead.details.city;
      }
    } else {
      map.set(phone, {
        phone,
        name: lead.details.customerName || 'Unknown',
        email: lead.details.email || '',
        city: lead.details.city || '',
        orderCount: 1,
        totalSpend: order.revenue,
        lastOrderDate: order.date,
      });
    }
  }

  return [...map.values()].sort((a, b) => b.totalSpend - a.totalSpend);
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  return (
    <div className="w-9 h-9 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-xs font-bold shrink-0">
      {initials}
    </div>
  );
}

export function CustomersTab({ orders, currencySymbol }: CustomersTabProps) {
  const [search, setSearch] = useState('');
  const customers = useMemo(() => deriveCustomers(orders), [orders]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpend, 0);
  const repeatCustomers = customers.filter(c => c.orderCount > 1).length;

  if (customers.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-50 mb-4">
          <Users className="h-7 w-7 text-zinc-300" />
        </div>
        <p className="text-sm font-semibold text-zinc-700">No customers yet</p>
        <p className="text-xs text-zinc-400 mt-1">Customers will appear here once orders are confirmed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Total</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{customers.length}</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{currencySymbol}{totalRevenue.toFixed(0)}</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Repeat</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{repeatCustomers}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search by name, phone, email or city…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-3 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
        />
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {filtered.map(c => (
          <div key={c.phone} className="bg-white border border-zinc-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Avatar name={c.name} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-zinc-900 truncate">{c.name}</p>
                  <span className="shrink-0 text-sm font-bold text-emerald-700">{currencySymbol}{c.totalSpend.toFixed(0)}</span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {c.phone !== 'unknown' && (
                    <p className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Phone className="w-3 h-3 text-zinc-400" />{c.phone}
                    </p>
                  )}
                  {c.email && (
                    <p className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Mail className="w-3 h-3 text-zinc-400" />{c.email}
                    </p>
                  )}
                  {c.city && (
                    <p className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <MapPin className="w-3 h-3 text-zinc-400" />{c.city}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[11px] text-zinc-400">{c.orderCount} order{c.orderCount !== 1 ? 's' : ''}</span>
                  <span className="text-[11px] text-zinc-300">·</span>
                  <span className="text-[11px] text-zinc-400">Last: {format(new Date(c.lastOrderDate), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-zinc-400 py-8">No customers match your search.</p>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Customer</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Contact</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Location</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Orders</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Total Spend</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Last Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map(c => (
              <tr key={c.phone} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={c.name} />
                    <p className="font-medium text-zinc-900 truncate max-w-[140px]">{c.name}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-zinc-700 text-sm">{c.phone !== 'unknown' ? c.phone : <span className="text-zinc-300">—</span>}</p>
                  {c.email && <p className="text-xs text-zinc-400 mt-0.5">{c.email}</p>}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-600">
                  {c.city || <span className="text-zinc-300">—</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold border ${
                    c.orderCount > 1
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                  }`}>
                    {c.orderCount}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                  {currencySymbol}{c.totalSpend.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right text-xs text-zinc-400">
                  {format(new Date(c.lastOrderDate), 'MMM d, yyyy')}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-400">
                  No customers match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
