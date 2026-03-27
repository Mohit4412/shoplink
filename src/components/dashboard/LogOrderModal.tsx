import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Product, Order } from '../../types';

interface LogOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  currencySymbol: string;
  todayStr: string;
  onSave: (order: { productId: string; quantity: number; revenue: number; notes: string; date: string }) => void;
  initialData?: Order | null;
}

export function LogOrderModal({ isOpen, onClose, products, currencySymbol, todayStr, onSave, initialData }: LogOrderModalProps) {
  const [newOrder, setNewOrder] = useState({
    productId: '',
    quantity: 1,
    revenue: 0,
    notes: '',
    date: todayStr,
  });

  useEffect(() => {
    if (initialData) {
      setNewOrder({
        productId: initialData.productId,
        quantity: initialData.quantity,
        revenue: initialData.revenue,
        notes: initialData.notes || '',
        date: initialData.date.split('T')[0],
      });
    } else {
      setNewOrder({
        productId: '',
        quantity: 1,
        revenue: 0,
        notes: '',
        date: todayStr,
      });
    }
  }, [initialData, isOpen, todayStr]);

  const handleProductSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const pid = e.target.value;
    const prod = products.find(p => p.id === pid);
    setNewOrder(prev => ({
      ...prev,
      productId: pid,
      revenue: prod ? prod.price * prev.quantity : 0
    }));
  };

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const qty = parseInt(e.target.value) || 1;
    const prod = products.find(p => p.id === newOrder.productId);
    setNewOrder(prev => ({
      ...prev,
      quantity: qty,
      revenue: prod ? prod.price * qty : prev.revenue
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newOrder.productId) return;
    
    // Add fake local noon time to the selected date string, then turn it into real ISO
    const isoDate = new Date(`${newOrder.date}T12:00:00`).toISOString();
    
    onSave({
       ...newOrder,
       date: isoDate
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Order" : "Add Manual Order"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
          <select
            required
            value={newOrder.productId}
            onChange={handleProductSelect}
            className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-"
          >
            <option value="" disabled>Select a product...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} - {currencySymbol}{p.price}</option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quantity"
            type="number"
            min="1"
            required
            value={newOrder.quantity}
            onChange={handleQuantityChange}
          />
          <Input
            label={`Revenue (${currencySymbol})`}
            type="number"
            min="0"
            step="0.01"
            required
            value={newOrder.revenue}
            onChange={(e) => setNewOrder(prev => ({ ...prev, revenue: parseFloat(e.target.value) || 0 }))}
          />
        </div>

        <Input
          label="Date"
          type="date"
          required
          value={newOrder.date}
          onChange={(e) => setNewOrder(prev => ({ ...prev, date: e.target.value }))}
        />

        <Textarea
          label="Notes (Optional)"
          placeholder="Customer details, source, etc."
          value={newOrder.notes}
          onChange={(e) => setNewOrder(prev => ({ ...prev, notes: e.target.value }))}
        />

        <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700">
            {initialData ? "Save Changes" : "Save Order"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
