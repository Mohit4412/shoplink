'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import type { Theme } from '../../../utils/themes';
import type { StoreSettings, Product } from '../../../types';
import { getCurrencySymbol } from '../../../utils/currency';
import { StoreFooter } from '../StoreFooter';

interface NoirStoreFrontProps {
  theme: Theme;
  store: StoreSettings;
  products: Product[];
  resolvedStoreId: string;
  isSubdomain: boolean;
  onContactClick: (product?: Product) => void;
  onOrderClick: (product: Product) => void;
  isFreePlan: boolean;
}

export function NoirStoreFront({
  theme, store, products, resolvedStoreId, isSubdomain, onContactClick, onOrderClick, isFreePlan,
}: NoirStoreFrontProps) {
  const t = theme.tokens;
  const currencySymbol = getCurrencySymbol(store.currency);
  const activeProducts = products.filter(p => p.status === 'Active');

  // Limit to 6-8 products for luxury feel
  const featuredProducts = activeProducts.slice(0, 6);

  const productHref = (id: string) => isSubdomain ? `/product/${id}` : `/${resolvedStoreId}/product/${id}`;

  // Gold star rating component
  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className="text-sm"
          style={{ color: star <= Math.round(rating) ? t.accent : '#404040' }}
        >
          ★
        </span>
      ))}
    </div>
  );

  return (
    <>
      {/* Hero banner */}
      <div className="relative px-6 py-16 text-center" style={{ background: t.heroBg }}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4" style={{ background: t.accentLight, color: t.accent, border: `1px solid ${t.cardBorder}` }}>
          New Collection · 2026
        </div>
        <h1 className="text-4xl font-bold mb-3 leading-tight" style={{ color: t.heroHeading }}>
          Timeless<br />Elegance
        </h1>
        {store.tagline && (
          <p className="text-sm tracking-wide mb-2" style={{ color: t.heroSub }}>
            {store.tagline}
          </p>
        )}
        <p className="text-sm tracking-wide" style={{ color: t.heroSub }}>
          Explore Collection →
        </p>
      </div>

      {/* The Edit section */}
      <main className="flex-1 pb-32 px-4 pt-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: t.sectionHeading }}>
              The Edit
            </h2>
            <p className="text-sm" style={{ color: t.productMeta }}>
              {featuredProducts.length} pieces
            </p>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: t.accentLight, border: `1px solid ${t.cardBorder}` }}>
                <MessageCircle className="w-10 h-10" style={{ color: t.accent }} />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: t.heroHeading }}>Curating Collection</h3>
              <p className="text-sm max-w-xs" style={{ color: t.heroSub }}>
                {store.name} is carefully selecting pieces. Check back soon.
              </p>
            </div>
          ) : (
            <div className="space-y-12 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:space-y-0">
              {featuredProducts.map(product => (
                <div
                  key={product.id}
                  className="rounded-3xl overflow-hidden"
                  style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}
                >
                  {/* Product image */}
                  <Link href={productHref(product.id)}>
                    <div className="relative aspect-[3/4] overflow-hidden" style={{ background: t.cardImageBg }}>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white text-xs font-bold px-3 py-1.5 bg-black/80 rounded-full">Sold Out</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product details */}
                  <div className="p-6">
                    {/* Category */}
                    {product.category && (
                      <p className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: t.productMeta }}>
                        {product.category}
                      </p>
                    )}

                    {/* Product name */}
                    <Link href={productHref(product.id)}>
                      <h3 className="text-xl font-bold mb-3 leading-tight" style={{ color: t.productName }}>
                        {product.name}
                      </h3>
                    </Link>

                    {/* Price */}
                    <p className="text-2xl font-bold mb-4" style={{ color: t.productPrice }}>
                      {currencySymbol}{product.price.toLocaleString()}
                    </p>

                    {/* Description */}
                    <p className="text-sm leading-relaxed mb-4" style={{ color: t.heroSub }}>
                      {product.description || 'Pure craftsmanship with attention to every detail. Each piece is individually quality-checked and ships in our signature packaging.'}
                    </p>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6 pb-6 border-b" style={{ borderColor: t.cardBorder }}>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide font-bold mb-1" style={{ color: t.productMeta }}>
                          Material
                        </p>
                        <p className="text-sm" style={{ color: t.productName }}>
                          Premium Quality
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide font-bold mb-1" style={{ color: t.productMeta }}>
                          Shipping
                        </p>
                        <p className="text-sm" style={{ color: t.productName }}>
                          Free · 3–5 days
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide font-bold mb-1" style={{ color: t.productMeta }}>
                          Care
                        </p>
                        <p className="text-sm" style={{ color: t.productName }}>
                          Professional care
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide font-bold mb-1" style={{ color: t.productMeta }}>
                          Packaging
                        </p>
                        <p className="text-sm" style={{ color: t.productName }}>
                          Signature box
                        </p>
                      </div>
                    </div>

                    {/* Client Notes */}
                    <div className="mb-6">
                      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: t.productMeta }}>
                        Client Notes
                      </p>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold" style={{ color: t.productName }}>
                              Nalini R. · Mumbai
                            </p>
                            <p className="text-xs" style={{ color: t.productMeta }}>
                              Verified purchase
                            </p>
                          </div>
                          <StarRating rating={5} />
                          <p className="text-sm leading-relaxed mt-2" style={{ color: t.heroSub }}>
                            "The quality is breathtaking in person — photographs don't do it justice. Worth every rupee."
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Enquire button */}
                    {product.stock > 0 && (
                      <button
                        onClick={() => onOrderClick(product)}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-sm font-bold transition-colors min-h-[44px]"
                        style={{ background: t.btnBg, color: t.btnText }}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Enquire on WhatsApp
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Final CTA */}
        {featuredProducts.length > 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => onContactClick()}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold transition-colors min-h-[44px]"
              style={{ background: t.accentLight, color: t.accent, border: `1px solid ${t.cardBorder}` }}
            >
              <MessageCircle className="w-4 h-4" />
              Chat with Seller
            </button>
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
        <span className="font-semibold text-sm">Enquire</span>
      </button>
    </>
  );
}
