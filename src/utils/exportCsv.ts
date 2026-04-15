import { Order, Product } from '../types';
import { parseOrderLeadNotes, formatPaymentMethodLabel } from './orderLeads';
import { format } from 'date-fns';

export function exportOrdersCsv(orders: Order[], products: Product[], currencySymbol: string) {
  const headers = ['Date', 'Order ID', 'Product', 'Customer', 'Phone', 'Email', 'Address', 'City', 'Pincode', 'Payment', 'Quantity', 'Revenue', 'Status'];

  const rows = orders.map(order => {
    const product = products.find(p => p.id === order.productId);
    const lead = parseOrderLeadNotes(order.notes);
    return [
      format(new Date(order.date), 'yyyy-MM-dd HH:mm'),
      order.id,
      product?.name ?? 'Unknown',
      lead.details.customerName ?? '',
      lead.details.customerPhone ?? '',
      lead.details.email ?? '',
      lead.details.address ?? '',
      lead.details.city ?? '',
      lead.details.pincode ?? '',
      formatPaymentMethodLabel(lead.details.paymentMethod) ?? '',
      order.quantity,
      order.revenue.toFixed(2),
      order.status,
    ];
  });

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
