import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CartItem } from '../../types';
import { Minus, Plus, ShoppingCart, MessageCircle } from 'lucide-react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currencySymbol: string;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onCheckout: () => void;
}

export function CartModal({ isOpen, onClose, cartItems, currencySymbol, onUpdateQuantity, onCheckout }: CartModalProps) {
  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Your Cart">
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">Your cart is empty</p>
          <Button variant="outline" className="mt-6" onClick={onClose}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.product.id} className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <img 
                  src={item.product.imageUrl} 
                  alt={item.product.name} 
                  className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{item.product.name}</h4>
                  <p className="text-sm text-gray-500">{currencySymbol}{item.product.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                  <button 
                    onClick={() => onUpdateQuantity(item.product.id, -1)}
                    className="p-1 rounded hover:bg-white hover:shadow-sm transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item.product.id, 1)}
                    className="p-1 rounded hover:bg-white hover:shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>{currencySymbol}{total.toFixed(2)}</span>
            </div>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white py-6" 
              onClick={onCheckout}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Checkout on WhatsApp
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
