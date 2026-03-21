import React, { useEffect } from 'react';
import { ShoppingBag, X, Plus, Minus, MessageCircle } from 'lucide-react';
import { CartItem } from '../../types';
import { Button } from '../ui/Button';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currencySymbol: string;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onCheckout: () => void;
}

export function CartDrawer({ isOpen, onClose, cartItems, currencySymbol, onUpdateQuantity, onCheckout }: CartDrawerProps) {
  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        <div className="flex items-center justify-between p-8 border-b border-black/5">
          <div className="flex flex-col">
            <h2 className="text-2xl font-serif tracking-tight text-gray-900 flex items-center gap-3">
              Your Bag
            </h2>
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mt-1">
              {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all duration-300 hover:rotate-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-gray-200" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-serif italic text-gray-900">Your bag is empty</p>
                <p className="text-sm text-gray-400 font-light max-w-[200px] mx-auto">Looks like you haven't added anything to your collection yet.</p>
              </div>
              <Button variant="outline" onClick={onClose} className="mt-4 rounded-full px-10 py-6 border-black/10 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-500">
                Start Exploring
              </Button>
            </div>
          ) : (
            <div className="space-y-10">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex gap-6 group">
                  <div className="w-28 h-36 shrink-0 bg-gray-50 rounded-2xl overflow-hidden relative">
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-col flex-1 justify-between py-1">
                    <div className="space-y-1">
                      <h4 className="text-lg font-serif tracking-tight text-gray-900 line-clamp-2 leading-tight">{item.product.name}</h4>
                      <p className="text-gray-400 font-light text-sm">{currencySymbol}{item.product.price.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-4 bg-gray-50 rounded-full px-4 py-2 border border-black/5">
                        <button 
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-4 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="font-medium text-gray-900">
                        {currencySymbol}{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-black/5 p-8 bg-white">
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Subtotal</span>
                <span className="text-sm font-medium text-gray-900">{currencySymbol}{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Shipping</span>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-900">Calculated at next step</span>
              </div>
              <div className="h-[1px] bg-black/5 w-full my-4" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-serif tracking-tight text-gray-900">Total</span>
                <span className="text-2xl font-serif tracking-tight text-gray-900">{currencySymbol}{total.toFixed(2)}</span>
              </div>
            </div>
            
            <Button 
              className="w-full text-white rounded-full py-8 text-xs font-bold uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] transition-all duration-500" 
              style={{ backgroundColor: 'var(--accent-color)' }}
              onClick={onCheckout}
            >
              <MessageCircle className="w-5 h-5 mr-3" />
              Complete via WhatsApp
            </Button>
            
            <p className="text-[10px] text-center text-gray-400 mt-6 uppercase tracking-widest font-bold">
              Secure Checkout • Direct to Merchant
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
