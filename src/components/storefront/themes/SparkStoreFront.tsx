'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import type { Theme } from '../../../utils/themes';
import type { StoreSettings, Product } from '../../../types';
import { getCurrencySymbol } from '../../../utils/currency';
import { StoreFooter } from '../StoreFooter';
import { HeroSection } from '../sections/HeroSection';

interface SparkStoreFrontProps {
  theme: Theme;
  store: StoreSettings;
  products: Product[];
  resolvedStoreId: string;
  isSubdomain: boolean;
  onContactClick: (product?: Product) => void;
  isFreePlan: boolean;
}

export function SparkStoreFront({
  theme,
  store,
  products,
  resolvedStoreId,
  isSubdomain,
  onContactClick,
  isFreePlan,
}: SparkStoreFrontProps) {
  const t = theme.tokens;
  const currencySymbol = getCurrencySymbol(store.currency);
  const activeProducts = products.filter(p => p.status === 'Active');

  // Collect unique categories
  const categories = ['All', ...Array.from(new Set(activeProducts.map(p => p.category).filter(Boolean)))];
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? activeProducts
    : activeProducts.filter(p => p.category === activeCategory);

  const productHref = (id: string) => isSubdomain ? `/product/${id}` : `/${resolvedStoreId}/product/${id}`;

  return (
    <>
      {/* Store Header / Profile */}
      <HeroSection theme={theme} store={store} />

      {/* Category filter — pill buttons, horizontally scrollable */}
      <div
        className="sticky top-[52px] z-40 border-b overflow-x-auto no-scrollbar"
        style={{ background: t.navBg, borderColor: t.navBorder }}
      >
        <div className="flex gap-2 px-3 py-2.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap min-h-[32px]"
              style={
                activeCategory === cat
                  ? { background: t.accent, color: t.btnText }
                  : { background: t.accentLight, color: t.productMeta }
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Instagram-style 2-col grid — no padding between cells */}
      <main className="flex-1 pb-28">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
            <p className="text-sm font-semibold" style={{ color: t.productMeta }}>
              No products in this category yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-[2px]">
            {filtered.map(product => (
              <div key={product.id} className="group relative">
                <Link href={productHref(product.id)} className="block">
                  {/* Square image */}
                  <div className="relative aspect-square overflow-hidden" style={{ background: t.cardImageBg }}>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold px-2 py-0.5 bg-black/60 rounded">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  {/* Name + price below */}
                  <div className="px-2 pt-2 pb-3">
                    <p className="text-xs font-semibold line-clamp-1 leading-tight" style={{ color: t.productName }}>
                      {product.name}
                    </p>
                    <p className="text-xs font-bold mt-0.5" style={{ color: t.productPrice }}>
                      {currencySymbol}{product.price.toFixed(2)}
                    </p>
                  </div>
                </Link>
                {/* Quick order button — appears on hover/tap */}
                {product.stock > 0 && (
                  <button
                    onClick={() => onContactClick(product)}
                    className="absolute bottom-[44px] left-2 right-2 h-8 rounded-lg text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 min-h-[44px]"
                    style={{ background: t.waBg, color: t.waText }}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Order
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <StoreFooter store={store} theme={theme} isFreePlan={isFreePlan} />

      {/* Floating WhatsApp */}
      <button
        onClick={() => onContactClick()}
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl hover:-translate-y-1 transition-all duration-300 min-h-[44px]"
        style={{ background: '#25D366', color: '#FFFFFF' }}
        aria-label="Chat to Order on WhatsApp"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="font-semibold text-sm">Chat to Order</span>
      </button>
    </>
  );
}
