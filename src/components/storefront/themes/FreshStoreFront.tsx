'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Plus, Minus } from 'lucide-react';
import type { Theme } from '../../../utils/themes';
import type { StoreSettings, Product } from '../../../types';
import { getCurrencySymbol } from '../../../utils/currency';
import { StoreFooter } from '../StoreFooter';

interface FreshStoreFrontProps {
  theme: Theme;
  store: StoreSettings;
  products: Product[];
  resolvedStoreId: string;
  isSubdomain: boolean;
  onContactClick: (product?: Product) => void;
  onOrderClick: (product: Product) => void;
  isFreePlan: boolean;
}

export function FreshStoreFront({
  theme, store, products, resolvedStoreId, isSubdomain, onContactClick, onOrderClick, isFreePlan,
}: FreshStoreFrontProps) {
  const t = theme.tokens;
  const currencySymbol = getCurrencySymbol(store.currency);
  const activeProducts = products.filter(p => p.status === 'Active');

  // Collect unique categories
  const categories = ['All', ...Array.from(new Set(activeProducts.map(p => p.category).filter(Boolean)))];
  const [activeCategory, setActiveCategory] = useState('All');

  // Quantity state for each product
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(activeProducts.map(p => [p.id, 1]))
  );

  const filtered = activeCategory === 'All'
    ? activeProducts
    : activeProducts.filter(p => p.category === activeCategory);

  const productHref = (id: string) => isSubdomain ? `/product/${id}` : `/${resolvedStoreId}/product/${id}`;

  const incrementQty = (productId: string) => {
    setQuantities(prev => ({ ...prev, [productId]: Math.min((prev[productId] || 1) + 1, 99) }));
  };

  const decrementQty = (productId: string) => {
    setQuantities(prev => ({ ...prev, [productId]: Math.max((prev[productId] || 1) - 1, 1) }));
  };

  const handleOrderWithQty = (product: Product) => {
    onOrderClick(product);
  };

  return (
    <>
      {/* Hero banner */}
      <div className="px-4 py-8 text-center" style={{ background: t.heroBg }}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-3" style={{ background: t.accent, color: t.btnText }}>
          <span className="text-base">✓</span>
          Made fresh today
        </div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: t.heroHeading }}>
          Made fresh,<br />delivered with love
        </h1>
        {store.tagline && (
          <p className="text-sm mt-2" style={{ color: t.heroSub }}>
            {store.tagline}
          </p>
        )}
        <p className="text-sm mt-1" style={{ color: t.heroSub }}>
          Browse menu below
        </p>
      </div>

      {/* Category filter */}
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

      {/* Product list */}
      <main className="flex-1 pb-28 px-4 pt-4 max-w-7xl mx-auto w-full">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
            <p className="text-sm font-semibold" style={{ color: t.productMeta }}>
              No products in this category yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map(product => {
              const qty = quantities[product.id] || 1;
              const totalPrice = product.price * qty;

              return (
                <div
                  key={product.id}
                  className="rounded-2xl overflow-hidden border"
                  style={{ background: t.cardBg, borderColor: t.cardBorder, boxShadow: t.cardShadow }}
                >
                  <div className="flex gap-3 p-3">
                    {/* Product image */}
                    <Link href={productHref(product.id)} className="shrink-0">
                      <div
                        className="w-24 h-24 rounded-xl overflow-hidden relative"
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
                            <span className="text-white text-[9px] font-bold px-1.5 py-0.5 bg-black/60 rounded">Out of Stock</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product details */}
                    <div className="flex-1 min-w-0">
                      <Link href={productHref(product.id)}>
                        <h3 className="text-sm font-bold line-clamp-2 leading-tight mb-1" style={{ color: t.productName }}>
                          {product.name}
                        </h3>
                      </Link>

                      {product.category && (
                        <p className="text-[10px] uppercase tracking-wide font-semibold mb-2" style={{ color: t.productMeta }}>
                          {product.category}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        {/* Price */}
                        <div>
                          <p className="text-lg font-bold" style={{ color: t.productPrice }}>
                            {currencySymbol}{product.price.toFixed(2)}
                          </p>
                          <p className="text-[10px]" style={{ color: t.productMeta }}>
                            per unit
                          </p>
                        </div>

                        {/* Quantity selector */}
                        {product.stock > 0 && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => decrementQty(product.id)}
                              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
                              style={{ background: t.accentLight, color: t.accent }}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-bold w-6 text-center" style={{ color: t.productName }}>
                              {qty}
                            </span>
                            <button
                              onClick={() => incrementQty(product.id)}
                              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
                              style={{ background: t.accent, color: t.btnText }}
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order button with total price */}
                  {product.stock > 0 && (
                    <button
                      onClick={() => handleOrderWithQty(product)}
                      className="w-full py-3 text-sm font-bold flex items-center justify-center gap-2 border-t transition-colors min-h-[44px]"
                      style={{ 
                        background: t.accent, 
                        color: t.btnText,
                        borderColor: t.cardBorder,
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Order Now — {currencySymbol}{totalPrice.toFixed(2)}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Free delivery banner */}
        {filtered.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl text-center" style={{ background: t.accentLight }}>
            <p className="text-xs font-semibold" style={{ color: t.accent }}>
              🚚 Free delivery above {currencySymbol}500
            </p>
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
