import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface MobileCTAProps {
  themeAccentClass: string;
  onCheckoutClick: () => void;
  totalItems: number;
  totalPrice: number;
  currencySymbol: string;
}

export function MobileCTA({ themeAccentClass, onCheckoutClick, totalItems, totalPrice, currencySymbol }: MobileCTAProps) {
  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-8 left-4 right-4 sm:hidden z-50 animate-in slide-in-from-bottom-10 duration-500">
      <button
        onClick={onCheckoutClick}
        className={`w-full flex items-center justify-between px-8 py-5 rounded-full font-bold text-base uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-transform active:scale-95 ${themeAccentClass}`}
        style={{ backgroundColor: 'var(--accent-color)', color: '#fff' }}
      >
        <div className="flex items-center">
          <div className="relative mr-4">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-lg border border-black/5">
              {totalItems}
            </span>
          </div>
          <span>View Bag</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-[1px] h-4 bg-white/20" />
          <span>{currencySymbol}{totalPrice.toFixed(2)}</span>
        </div>
      </button>
    </div>
  );
}
