'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';

interface Variant {
  name: string;
  options: string[];
}

interface ProductActionsProps {
  productName: string;
  price: number;
  compareAtPrice?: number;
  variants?: Variant[];
  stockQuantity?: number;
  whatsAppNumber: string;
  currencySymbol?: string;
  storeName?: string;
  accentColor?: string;
  onOrder?: () => void;
}

export function ProductActions({
  productName,
  price,
  compareAtPrice,
  variants = [],
  stockQuantity,
  whatsAppNumber,
  currencySymbol = '₹',
  accentColor = '#0d9488',
  onOrder,
}: ProductActionsProps) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const handleVariantSelect = (variantName: string, option: string) => {
    setSelectedVariants(prev => ({ ...prev, [variantName]: option }));
  };

  const allVariantsSelected = variants.every(v => selectedVariants[v.name]);

  const handleOrder = () => {
    if (variants.length > 0 && !allVariantsSelected) {
      alert('Please select all options before ordering.');
      return;
    }

    // Fire the tracking callback first
    onOrder?.();

    let message = `Hi! I want to order: *${productName}* — ${currencySymbol}${price.toFixed(2)}. Please confirm availability. 🙏`;
    if (variants.length > 0) {
      const variantText = Object.entries(selectedVariants)
        .map(([name, val]) => `${name}: ${val}`)
        .join(', ');
      message += `\nOptions: ${variantText}`;
    }

    window.open(`https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const discountRatio = compareAtPrice ? Math.round((1 - price / compareAtPrice) * 100) : 0;

  return (
    <div className="flex flex-col mb-8">
      {/* Price Block */}
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl md:text-4xl font-extrabold" style={{ color: accentColor }}>
            {currencySymbol}{price.toFixed(2)}
          </span>
          {compareAtPrice && compareAtPrice > price && (
            <>
              <span className="text-lg md:text-xl font-medium text-gray-400 line-through decoration-1">
                {currencySymbol}{compareAtPrice.toFixed(2)}
              </span>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider rounded-full">
                Save {discountRatio}%
              </span>
            </>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">Chat on WhatsApp to confirm price &amp; delivery</p>
      </div>

      {/* Variants */}
      {variants.length > 0 && (
        <div className="space-y-5 mb-8">
          {variants.map((variant) => (
            <div key={variant.name} className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm font-semibold text-gray-900 uppercase tracking-widest">
                {variant.name}
              </div>
              <div className="flex flex-wrap gap-2">
                {variant.options.map((option) => {
                  const isSelected = selectedVariants[variant.name] === option;
                  return (
                    <button
                      key={option}
                      onClick={() => handleVariantSelect(variant.name, option)}
                      className={`min-w-[3rem] h-10 px-4 rounded-lg border flex items-center justify-center text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50 text-teal-800 font-bold ring-1 ring-teal-600'
                          : 'border-gray-200 bg-white text-gray-700 font-medium hover:border-gray-400'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stock Indication */}
      {typeof stockQuantity === 'number' && (
        <div className={`text-sm font-medium flex items-center gap-2 mb-6 ${stockQuantity <= 5 ? 'text-orange-600' : 'text-green-600'}`}>
          <div className={`w-2 h-2 rounded-full ${stockQuantity <= 5 ? 'bg-orange-500' : 'bg-green-500 animate-pulse'}`} />
          {stockQuantity <= 5 ? `Hurry, only ${stockQuantity} left in stock!` : 'In Stock & Ready to Ship'}
        </div>
      )}

      {/* Order Button */}
      <button
        onClick={handleOrder}
        className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white h-14 rounded-xl text-base font-bold shadow-lg shadow-[#25D366]/20 transition-all hover:bg-[#20BE5A] hover:-translate-y-0.5 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
      >
        Order on WhatsApp
        <ShoppingBag className="w-5 h-5 group-hover:animate-bounce" />
      </button>
    </div>
  );
}
