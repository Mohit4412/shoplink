'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Theme } from '../../../utils/themes';
import type { StoreSettings, Product } from '../../../types';
import { getCurrencySymbol } from '../../../utils/currency';
import { StoreFooter } from '../StoreFooter';

interface CraftStoreFrontProps {
  theme: Theme;
  store: StoreSettings;
  products: Product[];
  resolvedStoreId: string;
  isSubdomain: boolean;
  onContactClick: (product?: Product) => void;
  isFreePlan: boolean;
}

export function CraftStoreFront({
  theme,
  store,
  products,
  resolvedStoreId,
  isSubdomain,
  onContactClick,
  isFreePlan,
}: CraftStoreFrontProps) {
  const t = theme.tokens;
  const currencySymbol = getCurrencySymbol(store.currency);
  const activeProducts = products.filter(p => p.status === 'Active');

  const [currentIndex, setCurrentIndex] = useState(0);

  const currentProduct = activeProducts[currentIndex];
  const hasNext = currentIndex < activeProducts.length - 1;
  const hasPrev = currentIndex > 0;

  const goNext = () => {
    if (hasNext) setCurrentIndex(prev => prev + 1);
  };

  const goPrev = () => {
    if (hasPrev) setCurrentIndex(prev => prev - 1);
  };

  const productHref = (id: string) => isSubdomain ? `/product/${id}` : `/${resolvedStoreId}/product/${id}`;

  // Gold star rating component
  const StarRating = ({ rating, count }: { rating: number; count: number }) => (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className="text-base"
            style={{ color: star <= Math.round(rating) ? t.accent : '#d1d5db' }}
          >
            ★
          </span>
        ))}
      </div>
      <span className="text-sm" style={{ color: t.productMeta }}>
        {rating.toFixed(1)} · {count} reviews
      </span>
    </div>
  );

  if (activeProducts.length === 0) {
    return (
      <>
        <main className="flex-1 flex flex-col items-center justify-center py-32 px-6 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: t.accentLight }}>
            <MessageCircle className="w-10 h-10" style={{ color: t.accent }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: t.heroHeading }}>No products yet</h2>
          <p className="text-sm max-w-xs" style={{ color: t.heroSub }}>
            {store.name} is curating their collection. Check back soon!
          </p>
        </main>
        <StoreFooter store={store} theme={theme} isFreePlan={isFreePlan} />
      </>
    );
  }

  return (
    <>
      {/* Editorial single-product view */}
      <main className="flex-1 pb-28">
        {currentProduct && (
          <div className="min-h-[calc(100vh-52px)]">
            {/* Large hero image */}
            <div className="relative w-full aspect-[3/4] overflow-hidden" style={{ background: t.cardImageBg }}>
              <Link href={productHref(currentProduct.id)}>
                <img
                  src={currentProduct.imageUrl}
                  alt={currentProduct.name}
                  className="h-full w-full object-cover"
                  loading="eager"
                />
              </Link>
              {currentProduct.stock === 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-sm font-bold px-4 py-2 bg-black/60 rounded">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Product details */}
            <div className="px-6 py-8">
              {/* Category badge */}
              {currentProduct.category && (
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: t.productMeta }}>
                  {currentProduct.category} · Handmade
                </p>
              )}

              {/* Product name */}
              <Link href={productHref(currentProduct.id)}>
                <h2 className="text-2xl font-bold mb-4 leading-tight" style={{ color: t.productName }}>
                  {currentProduct.name}
                </h2>
              </Link>

              {/* Mock rating */}
              <div className="mb-4">
                <StarRating rating={4.8} count={18} />
              </div>

              {/* Price */}
              <div className="mb-6">
                <p className="text-3xl font-bold" style={{ color: t.productPrice }}>
                  {currencySymbol}{currentProduct.price.toFixed(2)}
                </p>
                <p className="text-sm mt-1" style={{ color: t.productMeta }}>
                  Free shipping · Ships in 3 days
                </p>
              </div>

              {/* Story quote */}
              <div className="mb-8 p-6 rounded-2xl" style={{ background: t.accentLight, borderLeft: `4px solid ${t.accent}` }}>
                <p className="text-base leading-relaxed italic" style={{ color: t.heroSub }}>
                  "{currentProduct.description || 'Each piece is handcrafted with love and care. No two items are exactly alike — the slight variations are what makes each one truly one of a kind.'}"
                </p>
              </div>

              {/* Material/details grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: t.productMeta }}>
                    Material
                  </p>
                  <p className="text-sm font-medium" style={{ color: t.productName }}>
                    Handcrafted
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: t.productMeta }}>
                    Care
                  </p>
                  <p className="text-sm font-medium" style={{ color: t.productName }}>
                    Handle with care
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: t.productMeta }}>
                    Packaging
                  </p>
                  <p className="text-sm font-medium" style={{ color: t.productName }}>
                    Gift box included
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: t.productMeta }}>
                    Stock
                  </p>
                  <p className="text-sm font-medium" style={{ color: currentProduct.stock > 0 ? t.accent : '#ef4444' }}>
                    {currentProduct.stock > 0 ? `${currentProduct.stock} available` : 'Out of stock'}
                  </p>
                </div>
              </div>

              {/* Testimonial */}
              <div className="mb-8">
                <p className="text-sm font-semibold mb-3" style={{ color: t.sectionHeading }}>
                  What people say
                </p>
                <div className="p-4 rounded-xl" style={{ background: t.accentLight }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold" style={{ color: t.productName }}>
                      Deepa M.
                    </p>
                    <p className="text-xs" style={{ color: t.productMeta }}>
                      Bangalore
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: t.heroSub }}>
                    "I've bought from many handmade sellers but this is the most beautiful piece I own. The craftsmanship is exactly right."
                  </p>
                </div>
              </div>

              {/* Order button */}
              {currentProduct.stock > 0 && (
                <button
                  onClick={() => onContactClick(currentProduct)}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-base font-bold transition-colors min-h-[44px]"
                  style={{ background: t.waBg, color: t.waText }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Order via WhatsApp
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation arrows */}
        {activeProducts.length > 1 && (
          <div className="px-6 pb-8">
            <div className="flex items-center justify-between py-4 border-t" style={{ borderColor: t.navBorder }}>
              <button
                onClick={goPrev}
                disabled={!hasPrev}
                className="flex items-center gap-2 px-4 py-2 rounded-full transition-colors disabled:opacity-30 min-h-[44px]"
                style={{ background: hasPrev ? t.accentLight : 'transparent', color: t.productName }}
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-semibold">Previous</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: t.accent }}>
                  {currentIndex + 1}
                </span>
                <span className="text-sm" style={{ color: t.productMeta }}>
                  / {activeProducts.length}
                </span>
              </div>

              <button
                onClick={goNext}
                disabled={!hasNext}
                className="flex items-center gap-2 px-4 py-2 rounded-full transition-colors disabled:opacity-30 min-h-[44px]"
                style={{ background: hasNext ? t.accentLight : 'transparent', color: t.productName }}
              >
                <span className="text-sm font-semibold">Next piece</span>
                <ChevronRight className="w-5 h-5" />
              </button>
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
