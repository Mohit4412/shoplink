'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Order, Product } from '../../types';

const PAGE_SIZE = 10;

interface RecentOrdersTableProps {
  orders: Order[];
  products: Product[];
  currencySymbol: string;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (order: Order) => void;
}

export function RecentOrdersTable({ orders, products, currencySymbol, onEditOrder }: RecentOrdersTableProps) {
  const [page, setPage] = useState(1);

  const sorted = [...orders].reverse();
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <ShoppingBag className="w-10 h-10 text-gray-300" />
        <p className="text-sm text-gray-400 mt-2">No sales recorded yet</p>
        <p className="text-xs text-gray-400 mt-1">Confirmed orders will appear here</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="min-w-[420px] w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-2 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-[120px]">Date</th>
              <th className="pb-2 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Product</th>
              <th className="pb-2 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-[48px]">Qty</th>
              <th className="pb-2 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((order) => {
              const product = products.find(p => p.id === order.productId);
              return (
                <tr
                  key={order.id}
                  className="border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ height: 52 }}
                  onClick={() => onEditOrder(order)}
                >
                  <td className="py-2 text-xs text-gray-400 whitespace-nowrap pr-3">
                    {format(new Date(order.date), 'MMM d, h:mm a')}
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      {product?.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0"
                        />
                      )}
                      <span className="font-medium text-gray-900 truncate max-w-[130px]">
                        {product?.name || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 text-center text-sm text-gray-600">{order.quantity}</td>
                  <td className="py-2 text-right text-sm font-semibold text-green-700">
                    {currencySymbol}{order.revenue.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
