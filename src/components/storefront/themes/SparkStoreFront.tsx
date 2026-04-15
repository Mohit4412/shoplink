'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import type { Theme } from '../../../utils/themes';
import type { StoreSettings, Product } from '../../../types';
import { getCurrencySymbol } from '../../../utils/currency';
import { StoreFooter } from '../StoreFooter';

interface SparkStoreFrontProps {
  theme: Theme;
  store: StoreSettings;
  products: Product[];
  resolvedStoreId: string;
  isSubdomain: boolean;
  onContactClick: (product?: Product) => void;
  onOrderClick: (product: Product) => void;
  isFreePlan: boolean;
  searchQuery?: string;
}

export function SparkStoreFront({
  theme, store, products, resolvedStoreId, isSubdomain, onContactClick, onOrderClick, isFreePlan, searchQuery = '',
}: SparkStoreFrontProps) {
  const t = theme.tokens;
  const currencySymbol = getCurrencySymbol(store.currency);
  const activeProducts = products.filter(p => p.status === 'Active');

  // Collect unique categories
  const categories = ['All', ...Array.from(new Set(activeProducts.map(p => p.category).filter(Boolean)))];
  const [activeCategory, setActiveCategory] = useState('All');
  const featuredCollections = Array.from(
    new Set(activeProducts.map(product => product.collection).filter(Boolean))
  ).slice(0, 3) as string[];

  const filtered = useMemo(() => {
    const byCategory = activeCategory === 'All'
      ? activeProducts
      : activeProducts.filter(p => p.category === activeCategory);
    const q = searchQuery?.toLowerCase().trim();
    if (!q) return byCategory;
    return byCategory.filter(p =>
      p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [activeProducts, activeCategory, searchQuery]);

  const productHref = (id: string) => isSubdomain ? `/product/${id}` : `/${resolvedStoreId}/product/${id}`;

  return (
    <>
      <section className="px-4 pt-4 pb-5 sm:px-5">
        <div
          className="rounded-[28px] border px-4 py-4 sm:px-5"
          style={{ background: t.accentLight, borderColor: t.navBorder }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: t.productMeta }}>
                Curated edit
              </p>
              <h1 className="mt-2 text-[22px] font-black tracking-tight leading-tight" style={{ color: t.heroHeading }}>
                {store.name || 'Store'}
              </h1>
              {store.tagline && (
                <p className="mt-2 max-w-md text-[13px] leading-6" style={{ color: t.heroSub }}>
                  {store.tagline}
                </p>
              )}
            </div>
            <div
              className="shrink-0 rounded-2xl border px-3 py-2 text-right"
              style={{ background: t.cardBg, borderColor: t.navBorder }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.productMeta }}>
                Live now
              </p>
              <p className="mt-1 text-lg font-black leading-none" style={{ color: t.productName }}>
                {activeProducts.length}
              </p>
              <p className="mt-1 text-[11px] font-semibold" style={{ color: t.productMeta }}>
                pieces
              </p>
            </div>
          </div>

          {featuredCollections.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {featuredCollections.map((collection) => (
                <span
                  key={collection}
                  className="rounded-full border px-3 py-1 text-[11px] font-semibold"
                  style={{ borderColor: t.navBorder, color: t.productName, background: 'rgba(255,255,255,0.72)' }}
                >
                  {collection}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Category filter — pill buttons, horizontally scrollable */}
      <div
        className="sticky top-[52px] z-40 border-y overflow-x-auto no-scrollbar backdrop-blur-md"
        style={{ background: t.navBg, borderColor: t.navBorder }}
      >
        <div className="flex gap-2 px-4 py-3 sm:px-5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="shrink-0 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors whitespace-nowrap"
              style={
                activeCategory === cat
                  ? { background: t.accent, color: t.btnText, borderColor: t.accent }
                  : { background: t.cardBg, color: t.productMeta, borderColor: t.navBorder }
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid — 2 col mobile, 3 col md, 4 col lg, 5 col xl */}
      <main className="flex-1 px-2 pb-28 pt-3 sm:px-3">
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-[28px] border py-24 px-6 text-center"
            style={{ borderColor: t.navBorder, background: t.cardBg }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: t.productMeta }}>
              Nothing here yet
            </p>
            <p className="mt-2 text-sm font-semibold" style={{ color: t.productName }}>
              No products in this category yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map(product => (
              <div
                key={product.id}
                className="group relative overflow-hidden rounded-[24px] border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(15,15,15,0.08)]"
                style={{ background: t.cardBg, borderColor: t.navBorder }}
              >
                <Link href={productHref(product.id)} className="block">
                  <div className="relative aspect-[4/5] overflow-hidden" style={{ background: t.cardImageBg }}>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
                      {product.collection ? (
                        <span
                          className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
                          style={{ background: 'rgba(255,255,255,0.9)', color: t.productName }}
                        >
                          {product.collection}
                        </span>
                      ) : (
                        <span />
                      )}
                      {product.stock > 0 && product.stock <= 5 && (
                        <span
                          className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
                          style={{ background: 'rgba(15,15,15,0.78)', color: '#fff' }}
                        >
                          {product.stock} left
                        </span>
                      )}
                    </div>
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold px-2 py-0.5 bg-black/60 rounded">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  <div className="px-3 pb-3 pt-3">
                    {product.category && (
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.productMeta }}>
                        {product.category}
                      </p>
                    )}
                    <p className="mt-1 text-[13px] font-bold line-clamp-2 leading-tight min-h-[34px]" style={{ color: t.productName }}>
                      {product.name}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-[13px] font-black" style={{ color: t.productPrice }}>
                        {currencySymbol}{product.price.toFixed(2)}
                      </p>
                      <span className="text-[11px] font-medium" style={{ color: t.productMeta }}>
                        {product.stock > 0 ? 'Ready to order' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="px-3 pb-3">
                  {product.stock > 0 ? (
                    <button
                      onClick={() => onOrderClick(product)}
                      className="flex h-10 w-full items-center justify-center gap-1.5 rounded-full text-[12px] font-bold transition-all duration-300 sm:opacity-0 sm:translate-y-1 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
                      style={{ background: t.waBg, color: t.waText }}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Order on WhatsApp
                    </button>
                  ) : (
                    <div
                      className="flex h-10 w-full items-center justify-center rounded-full text-[12px] font-bold"
                      style={{ background: t.accentLight, color: t.productMeta }}
                    >
                      Sold out
                    </div>
                  )}
                </div>
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
