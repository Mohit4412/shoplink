'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Download, Edit2, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { format } from 'date-fns';
import { Order, Product } from '../../types';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

interface RecentOrdersTableProps {
  orders: Order[];
  products: Product[];
  currencySymbol: string;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (order: Order) => void;
}

export function RecentOrdersTable({ orders, products, currencySymbol, onEditOrder, onDeleteOrder }: RecentOrdersTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const sorted = [...orders].reverse();
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('No orders to export.');
      return;
    }
    const headers = ['Date', 'Product Name', 'Quantity', 'Revenue', 'Notes'];
    const csvRows = [headers.join(',')];
    orders.forEach(order => {
      const product = products.find(p => p.id === order.productId);
      const productName = product ? product.name.replace(/,/g, '') : 'Unknown Product';
      const notes = order.notes ? order.notes.replace(/,/g, ' ') : '';
      csvRows.push([format(new Date(order.date), 'MMM d, yyyy h:mm a'), productName, order.quantity, order.revenue.toFixed(2), notes].join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.revenue, 0);

  return (
    <Card>
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Sales History</h3>
          <p className="text-sm text-gray-400 mt-0.5">
            {orders.length} confirmed {orders.length === 1 ? 'sale' : 'sales'} &nbsp;·&nbsp;
            <span className="text-green-600 font-medium">{currencySymbol}{totalRevenue.toFixed(2)} total</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Rows per page */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-400 whitespace-nowrap">Rows per page</label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {PAGE_SIZE_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Qty</th>
              <th className="px-5 py-3 font-medium">Revenue</th>
              <th className="px-5 py-3 font-medium hidden md:table-cell">Notes</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <p className="text-gray-400 font-medium">No sales logged yet</p>
                  <p className="text-gray-300 text-xs mt-1">Manual and confirmed orders will appear here once they are recorded.</p>
                </td>
              </tr>
            ) : (
              paginated.map((order) => {
                const product = products.find(p => p.id === order.productId);
                return (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 group transition-colors">
                    <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">{format(new Date(order.date), 'MMM d, h:mm a')}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {product?.imageUrl && (
                          <img src={product.imageUrl} alt={product.name} className="w-7 h-7 rounded-md object-cover border border-gray-100 shrink-0" />
                        )}
                        <span className="font-medium text-gray-900 truncate max-w-[150px]">
                          {product?.name || 'Unknown Product'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{order.quantity}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-green-600 font-semibold">{currencySymbol}{order.revenue.toFixed(2)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs truncate max-w-[180px] hidden md:table-cell">
                      {order.notes || <span className="italic">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditOrder(order)}
                          className="p-1.5 text-gray-400 hover:text-brand- rounded-md hover:bg-brand- transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteOrder(order)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {orders.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <span className="text-xs">
            Showing <span className="font-semibold text-gray-700">{Math.min((currentPage - 1) * pageSize + 1, sorted.length)}</span>
            {' '}–{' '}
            <span className="font-semibold text-gray-700">{Math.min(currentPage * pageSize, sorted.length)}</span>
            {' '}of{' '}
            <span className="font-semibold text-gray-700">{sorted.length}</span> entries
          </span>
          <div className="flex items-center gap-1">
            {/* First */}
            <button
              onClick={() => setPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            {/* Prev */}
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`e-${idx}`} className="px-2 text-gray-300">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item as number)}
                    className={`min-w-[30px] h-[30px] px-2 rounded-md text-xs font-medium border transition-colors ${
                      currentPage === item
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

            {/* Next */}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            {/* Last */}
            <button
              onClick={() => setPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
