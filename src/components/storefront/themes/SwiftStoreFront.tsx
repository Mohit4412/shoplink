'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, ChevronRight, TrendingUp } from 'lucide-react';
import type { Theme } from '../../../utils/themes';
import type { StoreSettings, Product } from '../../../types';
import { getCurrencySymbol } from '../../../utils/currency';
import { StoreFooter } from '../StoreFooter';

interface SwiftStoreFrontProps {
  theme: Theme;
  store: StoreSettings;
  products: Product[];
  resolvedStoreId: string;
  isSubdomain: boolean;
  onContactClick: (product?: Product) => void;
  onOrderClick: (product: Product) => void;
  isFreePlan: boolean;
}

export function SwiftStoreFront({
  theme, store, products, resolvedStoreId, isSubdomain, onContactClick, onOrderClick, isFreePlan,
}: SwiftStoreFrontProps) {
  const t = theme.tokens;
  const currencySymbol = getCurrencySymbol(store.currency);
  const activeProducts = products.filter(p => p.status === 'Active');

  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  const sortedProducts = [...activeProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0;
  });

  const productHref = (id: string) => isSubdomain ? `/product/${id}` : `/${resolvedStoreId}/product/${id}`;

  // Mock sold count for demo
  const getSoldCount = (productId: string) => {
    const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 15 + (hash % 85); // Random between 15-100
  };

  return (
    <>
      {/* Header with product count and sort */}
      <div className="px-4 py-4 border-b" style={{ borderColor: t.navBorder }}>
        {store.tagline && (
          <p className="text-xs mb-2 text-center" style={{ color: t.productMeta }}>
            {store.tagline}
          </p>
        )}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold" style={{ color: t.sectionHeading }}>
            {activeProducts.length} products available
          </h1>
          <button
            onClick={() => {
              if (sortBy === 'default') setSortBy('price-asc');
              else if (sortBy === 'price-asc') setSortBy('price-desc');
              else setSortBy('default');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors min-h-[32px]"
            style={{ background: t.accentLight, color: t.accent }}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Price {sortBy === 'price-asc' ? '↑' : sortBy === 'price-desc' ? '↓' : ''}
          </button>
        </div>
      </div>

      {/* Compact product list */}
      <main className="flex-1 pb-28">
        {sortedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: t.accentLight }}>
              <MessageCircle className="w-10 h-10" style={{ color: t.accent }} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: t.heroHeading }}>No products yet</h2>
            <p className="text-sm max-w-xs" style={{ color: t.heroSub }}>
              {store.name} is setting up their store. Check back soon!
            </p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-y sm:divide-y-0 sm:gap-px" style={{ borderColor: t.cardBorder }}>
            {sortedProducts.map(product => {
              const soldCount = getSoldCount(product.id);

              return (
                <div
                  key={product.id}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors"
                  style={{ background: t.cardBg }}
                >
                  <Link href={productHref(product.id)} className="flex gap-3">
                    {/* Product image */}
                    <div
                      className="w-20 h-20 rounded-lg overflow-hidden shrink-0 relative"
                      style={{ background: t.cardImageBg }}
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white text-[9px] font-bold px-1.5 py-0.5 bg-black/60 rounded">Out</span>
                        </div>
                      )}
                    </div>

                    {/* Product details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold line-clamp-1 leading-tight mb-0.5" style={{ color: t.productName }}>
                        {product.name}
                      </h3>

                      {/* Category badge */}
                      {product.category && (
                        <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: t.productMeta }}>
                          {product.category}
                        </p>
                      )}

                      {/* Price */}
                      <p className="text-lg font-bold mb-0.5" style={{ color: t.productPrice }}>
                        {currencySymbol}{product.price.toFixed(2)}
                      </p>

                      {/* Sold count */}
                      <div className="flex items-center gap-2">
                        <p className="text-[10px]" style={{ color: t.productMeta }}>
                          {soldCount} sold
                        </p>
                        {product.stock > 0 && product.stock < 10 && (
                          <span className="text-[10px] font-semibold" style={{ color: '#ef4444' }}>
                            • Only {product.stock} left
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Order arrow */}
                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onOrderClick(product);
                        }}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold transition-colors min-h-[44px]"
                        style={{ background: t.accentLight, color: t.accent }}
                      >
                        Order
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
          </div>
        )}

        {/* Quick stats banner */}
        {sortedProducts.length > 0 && (
          <div className="px-4 py-6 mt-6 max-w-7xl mx-auto w-full">
            <div className="rounded-2xl p-6 text-center" style={{ background: t.accentLight }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: t.accent }}>
                Fast Delivery
              </p>
              <p className="text-sm" style={{ color: t.productMeta }}>
                Most items ship within 24 hours
              </p>
            </div>
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
