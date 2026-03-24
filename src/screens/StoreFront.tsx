'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MessageCircle, ShoppingBag, Search, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getCurrencySymbol } from '../utils/currency';
import { getTheme, Theme } from '../utils/themes';
import { SectionConfig, StoreSettings, Product, PublicStorefrontData } from '../types';
import { HeroSection } from '../components/storefront/sections/HeroSection';
import { ThemeLayout } from '../utils/themes';
import { getProductUrl } from '../utils/storeUrl';

// ─── Grid layout helper ───────────────────────────────────────────────────────

function getGridClasses(productGrid: ThemeLayout['productGrid']): {
  wrapperClass: string;
  itemClass: string;
  isList: boolean;
} {
  switch (productGrid) {
    case 'grid-2col':
      return {
        wrapperClass: 'flex flex-wrap gap-x-4 gap-y-10',
        itemClass: 'w-[calc(50%-0.5rem)]',
        isList: false,
      };
    case 'grid-3col':
      return {
        wrapperClass: 'flex flex-wrap gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12',
        itemClass: 'w-[calc(50%-0.5rem)] md:w-[calc(33.333%-1rem)]',
        isList: false,
      };
    case 'list':
    default:
      return {
        wrapperClass: 'flex flex-col gap-4',
        itemClass: 'w-full',
        isList: true,
      };
  }
}

// ─── Card style helper ────────────────────────────────────────────────────────

function getCardStyle(
  cardStyle: ThemeLayout['cardStyle'],
  tokens: import('../utils/themes').ThemeTokens
): { style: React.CSSProperties; className: string; isBorderless: boolean } {
  switch (cardStyle) {
    case 'boxed':
      return {
        style: { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, boxShadow: tokens.cardShadow },
        className: 'rounded-2xl overflow-hidden',
        isBorderless: false,
      };
    case 'floating':
      return {
        style: { background: tokens.cardBg },
        className: 'rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.025]',
        isBorderless: false,
      };
    case 'borderless':
    default:
      return {
        style: { background: 'transparent' },
        className: '',
        isBorderless: true,
      };
  }
}

// ─── Section context passed to every renderer ─────────────────────────────────

interface SectionContext {
  theme: Theme;
  store: StoreSettings;
  activeProducts: Product[];
  featuredProducts: Product[];
  remainingProducts: Product[];
  currencySymbol: string;
  resolvedStoreId: string;
  onContactClick: (product?: Product) => void;
  searchQuery: string;
}

// ─── SectionRenderer – switch on section.id ───────────────────────────────────

function SectionRenderer({
  section,
  ctx,
}: {
  section: SectionConfig;
  ctx: SectionContext;
}) {
  const { theme, store, activeProducts, featuredProducts, remainingProducts, currencySymbol, resolvedStoreId, onContactClick } = ctx;
  const t = theme.tokens;
  const getProductHref = (p: Product) => `/${resolvedStoreId}/product/${p.id}`;
  const getItemClass = (baseClass: string, itemCount: number, isList: boolean) =>
    itemCount === 1 && !isList ? 'w-full max-w-sm mx-auto' : baseClass;

  switch (section.id) {

    // ── Hero ────────────────────────────────────────────────────────────────
    case 'hero':
      return <HeroSection theme={theme} store={store} />;

    // ── Featured Products ───────────────────────────────────────────────────
    case 'featured': {
      if (featuredProducts.length === 0) return null;
      const { wrapperClass, itemClass, isList } = getGridClasses(theme.layout.productGrid);
      const { style: cardSt, className: cardCls, isBorderless } = getCardStyle(theme.layout.cardStyle, t);
      return (
        <section id="products" className="mb-24 px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl font-bold tracking-tight mb-8 md:text-center"
            style={{ color: t.sectionHeading }}
          >
            Featured Highlights
          </h2>

          <div className={`${wrapperClass} ${!isList ? 'justify-start md:justify-center' : ''}`}>
            {featuredProducts.map(product => (
              isList ? (
                /* ── List row (always boxed) ───────────────────────── */
                <div
                  key={product.id}
                  className="group flex flex-row rounded-2xl overflow-hidden transition-all"
                  style={{
                    background: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                    boxShadow: t.cardShadow,
                  }}
                >
                  <Link
                    href={getProductHref(product)}
                    className="relative shrink-0 w-[120px] overflow-hidden"
                    style={{ background: t.cardImageBg }}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-xs font-bold px-2 py-1 bg-black/60 rounded">Out of Stock</span>
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-col justify-between flex-1 p-4">
                    <div>
                      <h3 className="text-base font-semibold mb-1 line-clamp-1" style={{ color: t.productName }}>
                        <Link href={getProductHref(product)}>{product.name}</Link>
                      </h3>
                      <p className="text-sm line-clamp-2" style={{ color: t.productMeta }}>{product.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-base font-bold" style={{ color: t.productPrice }}>
                        {currencySymbol}{product.price.toFixed(2)}
                      </span>
                      {product.stock === 0 ? (
                        <span className="px-4 py-2 rounded-full text-xs font-semibold bg-gray-100 text-gray-400">Out of Stock</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onContactClick(product)}
                          className="px-5 py-2 sm:py-2.5 rounded-full text-sm font-bold transition-opacity hover:opacity-90 min-h-[44px] flex items-center shadow-sm"
                          style={{ background: t.waBg, color: t.waText }}
                        >
                          Order on WhatsApp
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : isBorderless ? (
                /* ── Borderless card ───────────────────────────────── */
                <div key={product.id} className={`group flex flex-col ${getItemClass(itemClass, featuredProducts.length, isList)}`}>
                  <Link
                    href={getProductHref(product)}
                    className="relative aspect-[3/4] w-full overflow-hidden rounded-xl mb-3"
                    style={{ background: t.cardImageBg }}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-85"
                      loading="lazy"
                    />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-end p-3">
                        <span className="text-white text-xs font-bold px-2 py-1 bg-black/60 rounded w-full text-center">Out of Stock</span>
                      </div>
                    )}
                  </Link>
                  <h3 className="text-sm font-semibold line-clamp-1 mt-1" style={{ color: t.productName }}>
                    <Link href={getProductHref(product)}>{product.name}</Link>
                  </h3>
                  <span className="text-sm font-bold mt-0.5" style={{ color: t.productPrice }}>
                    {currencySymbol}{product.price.toFixed(2)}
                  </span>
                  {product.stock === 0 ? (
                    <span className="mt-3 w-full text-center py-2.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-400">Out of Stock</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onContactClick(product)}
                      className="mt-3 w-full inline-flex min-h-[44px] items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 shadow-sm"
                      style={{ background: t.waBg, color: t.waText }}
                    >
                      Order on WhatsApp
                    </button>
                  )}
                </div>
              ) : (
                /* ── Boxed / Floating card ─────────────────────────── */
                <div
                  key={product.id}
                  className={`group flex flex-col ${cardCls} ${getItemClass(itemClass, featuredProducts.length, isList)}`}
                  style={cardSt}
                >
                  <Link
                    href={getProductHref(product)}
                    className="relative aspect-[3/4] w-full overflow-hidden"
                    style={{ background: t.cardImageBg }}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-end p-3">
                        <span className="text-white text-xs font-bold px-2 py-1 bg-black/60 rounded w-full text-center">Out of Stock</span>
                      </div>
                    )}
                  </Link>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-base font-semibold mb-1 line-clamp-1" style={{ color: t.productName }}>
                      <Link href={getProductHref(product)}>{product.name}</Link>
                    </h3>
                    <p className="text-sm mb-4 line-clamp-2 flex-1" style={{ color: t.productMeta }}>
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-lg font-bold" style={{ color: t.productPrice }}>
                        {currencySymbol}{product.price.toFixed(2)}
                      </span>
                      {product.stock === 0 ? (
                        <span className="px-4 py-2 rounded-full text-xs font-semibold bg-gray-100 text-gray-400">Out of Stock</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onContactClick(product)}
                          className="w-full min-h-[44px] px-5 py-2.5 rounded-full text-sm font-bold transition-opacity hover:opacity-90 shadow-sm"
                          style={{ background: t.waBg, color: t.waText }}
                        >
                          Order on WhatsApp
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </section>
      );
    }

    // ── All Products ────────────────────────────────────────────────────────
    case 'all-products': {
      const q = ctx.searchQuery.toLowerCase().trim();
      const displayProducts = q
        ? remainingProducts.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
          )
        : remainingProducts;
      const { wrapperClass, itemClass, isList } = getGridClasses(theme.layout.productGrid);
      const { style: cardSt, className: cardCls, isBorderless } = getCardStyle(theme.layout.cardStyle, t);
      return (
        <section id="all-products" className="mb-16 px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl font-bold tracking-tight mb-8 md:text-center"
            style={{ color: t.sectionHeading }}
          >
            All Products
          </h2>
          <div className={`${wrapperClass} ${!isList ? 'justify-start md:justify-center' : ''}`}>
            {displayProducts.map(product => (
              isList ? (
                /* ── List row (always boxed) ───────────────────────── */
                <div
                  key={product.id}
                  className="group relative flex flex-row items-center rounded-xl overflow-hidden transition-all"
                  style={{
                    background: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                    boxShadow: t.cardShadow,
                  }}
                >
                  <Link
                    href={getProductHref(product)}
                    className="relative shrink-0 w-[120px] h-[120px] overflow-hidden"
                    style={{ background: t.cardImageBg }}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold px-1.5 py-0.5 bg-black/60 rounded">Out of Stock</span>
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-col justify-between flex-1 px-5 py-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: t.productMeta }}>
                        {product.category}
                      </p>
                      <h3 className="text-sm font-semibold line-clamp-1" style={{ color: t.productName }}>
                        <Link href={getProductHref(product)} className="focus:outline-none">
                          <span className="absolute inset-0" aria-hidden="true" />
                          {product.name}
                        </Link>
                      </h3>
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: t.productMeta }}>{product.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-base font-bold" style={{ color: t.productPrice }}>
                        {currencySymbol}{product.price.toFixed(2)}
                      </span>
                      {product.stock === 0 ? (
                        <span className="px-4 py-2 rounded-full text-xs font-semibold bg-gray-100 text-gray-400">Out of Stock</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onContactClick(product)}
                          className="min-h-[44px] px-5 py-2 sm:py-2.5 text-sm font-bold rounded-full shadow-sm"
                          style={{ background: t.waBg, color: t.waText }}
                        >
                          Order on WhatsApp
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : isBorderless ? (
                /* ── Borderless card ───────────────────────────────── */
                <div key={product.id} className={`group relative flex flex-col ${getItemClass(itemClass, displayProducts.length, isList)}`}>
                  <Link
                    href={getProductHref(product)}
                    className="relative aspect-[4/5] w-full overflow-hidden rounded-xl mb-3"
                    style={{ background: t.cardImageBg }}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover object-center transition-opacity duration-300 group-hover:opacity-85"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-end p-3">
                        <span className="text-white text-xs font-bold px-2 py-1 bg-black/60 rounded w-full text-center">Out of Stock</span>
                      </div>
                    )}
                  </Link>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium line-clamp-1" style={{ color: t.productName }}>
                      <Link href={getProductHref(product)} className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        {product.name}
                      </Link>
                    </h3>
                    <span className="text-sm font-semibold whitespace-nowrap" style={{ color: t.productPrice }}>
                      {currencySymbol}{product.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: t.productMeta }}>{product.category}</p>
                  {product.stock === 0 ? (
                    <span className="mt-3 w-full text-center py-2.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-400">Out of Stock</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onContactClick(product)}
                      className="mt-3 w-full inline-flex min-h-[44px] items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 shadow-sm"
                      style={{ background: t.waBg, color: t.waText }}
                    >
                      Order on WhatsApp
                    </button>
                  )}
                </div>
              ) : (
                /* ── Boxed / Floating card ─────────────────────────── */
                <div
                  key={product.id}
                  className={`group relative flex flex-col ${cardCls} ${getItemClass(itemClass, displayProducts.length, isList)}`}
                  style={cardSt}
                >
                  <Link
                    href={getProductHref(product)}
                    className="relative aspect-[4/5] w-full overflow-hidden rounded-xl mb-0"
                    style={{ background: t.cardImageBg }}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover object-center transition-opacity duration-300 group-hover:opacity-90"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-end p-3">
                        <span className="text-white text-xs font-bold px-2 py-1 bg-black/60 rounded w-full text-center">Out of Stock</span>
                      </div>
                    )}
                  </Link>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium line-clamp-1" style={{ color: t.productName }}>
                        <Link href={getProductHref(product)} className="focus:outline-none">
                          <span className="absolute inset-0" aria-hidden="true" />
                          {product.name}
                        </Link>
                      </h3>
                      <span className="text-sm font-semibold whitespace-nowrap" style={{ color: t.productPrice }}>
                        {currencySymbol}{product.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: t.productMeta }}>{product.category}</p>
                    {product.stock === 0 ? (
                      <span className="mt-3 w-full inline-flex items-center justify-center py-2.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-400">Out of Stock</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onContactClick(product)}
                        className="mt-3 w-full inline-flex min-h-[44px] items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 shadow-sm"
                        style={{ background: t.waBg, color: t.waText }}
                      >
                        Order on WhatsApp
                      </button>
                    )}
                  </div>
                </div>
              )
            ))}
            {displayProducts.length === 0 && (
              <div className="w-full py-20 text-center">
                <p className="text-sm uppercase tracking-widest font-semibold" style={{ color: t.productMeta }}>
                  {q ? `No products match "${ctx.searchQuery}"` : 'No products available yet'}
                </p>
              </div>
            )}
          </div>
        </section>
      );
    }

    // ── About ───────────────────────────────────────────────────────────────
    case 'about':
      return (
        <section className="mb-20 px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl p-10 md:p-16 text-center max-w-3xl mx-auto"
            style={{ background: t.accentLight, border: `1px solid ${t.cardBorder}` }}
          >
            <h2
              className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4"
              style={{ color: t.sectionHeading }}
            >
              About {store.name}
            </h2>
            <p className="text-base md:text-lg leading-relaxed" style={{ color: t.heroSub }}>
              {store.bio || store.tagline || 'We are passionate about bringing you the best products, curated with care and delivered with love.'}
            </p>
          </div>
        </section>
      );

    // ── WhatsApp CTA ────────────────────────────────────────────────────────
    case 'whatsapp-cta':
      return (
        <section className="mb-20 px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6"
            style={{ background: '#25D36615', border: '1px solid #25D36630' }}
          >
            <div>
              <h2
                className="text-xl md:text-2xl font-extrabold mb-2"
                style={{ color: t.sectionHeading }}
              >
                Questions? We're on WhatsApp 💬
              </h2>
              <p className="text-sm" style={{ color: t.productMeta }}>
                Chat with us directly to place an order, ask about availability, or get help.
              </p>
            </div>
            <button
              onClick={() => onContactClick()}
              className="shrink-0 flex items-center gap-3 px-6 py-3.5 rounded-full text-white font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              style={{ background: '#25D366' }}
            >
              <MessageCircle className="w-5 h-5" />
              Chat to Order
            </button>
          </div>
        </section>
      );

    default:
      return null;
  }
}

// ─── StoreFront ───────────────────────────────────────────────────────────────

export function StoreFront({ storefront }: { storefront?: PublicStorefrontData }) {
  const params = useParams<{ storeId: string }>();
  const storeId = params?.storeId as string;
  const { store: localStore, products: localProducts, user: localUser, trackStoreView, trackWhatsAppClick } = useStore();
  const publicUser = storefront?.user;
  const store = storefront?.store ?? localStore;
  const products = storefront?.products ?? localProducts;

  function getSubdomain(): string | null {
    if (typeof window === 'undefined') return null;
    const host = window.location.hostname;
    const parts = host.split('.');
    if (parts.length >= 3) return parts[0];
    if (host === 'localhost') return null;
    return null;
  }

  const resolvedStoreId = storeId || getSubdomain() || publicUser?.username || localUser?.username || 'store';
  const activeUser = publicUser ?? (
    localUser
      ? {
        username: localUser.username,
        whatsappNumber: localUser.whatsappNumber,
        plan: localUser.plan,
      }
      : null
  );

  const theme = getTheme(activeUser?.plan === 'Free' ? 'classic' : store.theme);
  const t = theme.tokens;

  const isMismatch = !storefront && localUser && resolvedStoreId && resolvedStoreId !== localUser.username;
  const activeProducts = products.filter(p => p.status === 'Active');

  // Featured: only show the top-4 if there are MORE than 4 active products.
  // If there are 4 or fewer, the featured section returns null and all-products shows everything.
  const featuredProducts = activeProducts.length > 4 ? activeProducts.slice(0, 4) : [];

  // Determine whether the featured section is enabled in the current section config
  const rawSections: SectionConfig[] = store.sections?.length
    ? store.sections
    : theme.defaultSections;
  const featuredEnabled = rawSections.some(s => s.id === 'featured' && s.enabled);

  // all-products shows everything except what's already in featured (when featured is on)
  const remainingProducts = featuredEnabled && featuredProducts.length > 0
    ? activeProducts.filter(p => !featuredProducts.some(f => f.id === p.id))
    : activeProducts;
  const currencySymbol = getCurrencySymbol(store.currency);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { trackStoreView(resolvedStoreId); }, [resolvedStoreId, trackStoreView]);

  const buildWhatsAppUrl = (product?: Product) => {
    const phone = activeUser?.whatsappNumber.replace(/\D/g, '') || '';
    if (product) {
      const productLink = getProductUrl(resolvedStoreId, product.id);
      const inStock = product.stock > 0 ? '' : '\n⚠️ Please confirm availability.';
      const message =
        `Hi ${store.name}! 👋\n\n` +
        `I'd like to order:\n` +
        `*${product.name}*\n` +
        `Price: ${currencySymbol}${product.price.toFixed(2)}` +
        (product.category ? `\nCategory: ${product.category}` : '') +
        `\n\n🔗 ${productLink}` +
        inStock +
        `\n\nPlease confirm and let me know how to proceed. 🙏`;
      return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    }
    const message = `Hi ${store.name}! 👋 I'm browsing your store and would love to know more about your products.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const handleContactClick = (product?: Product) => {
    trackWhatsAppClick(product?.id, resolvedStoreId);
    window.open(buildWhatsAppUrl(product), '_blank', 'noopener,noreferrer');
  };

  // Only render enabled sections, sorted by order
  const enabledSections = rawSections
    .filter(s => s.enabled)
    .sort((a, b) => a.order - b.order);

  const ctx: SectionContext = {
    theme,
    store,
    activeProducts,
    featuredProducts,
    remainingProducts,
    currencySymbol,
    resolvedStoreId,
    onContactClick: handleContactClick,
    searchQuery,
  };

  return (
    <div
      className="min-h-screen flex flex-col font-sans transition-colors duration-300"
      style={{ background: t.pageBg, color: t.pageText }}
    >
      {/* Demo banner */}
      {isMismatch && (
        <div className="bg-amber-100 text-amber-900 px-4 py-2 text-center text-[10px] font-bold uppercase tracking-widest">
          Demo Mode: Viewing {resolvedStoreId}
        </div>
      )}

      {/* Sticky Nav */}
      <div
        className="sticky top-0 z-50 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between transition-colors duration-300"
        style={{ background: t.navBg, borderColor: t.navBorder }}
      >
        <div className="font-bold text-lg tracking-tight flex items-center gap-3 overflow-hidden" style={{ color: t.navText }}>
          {store.logoUrl ? (
            <img src={store.logoUrl} alt={store.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
          ) : (
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={{ background: t.accent, color: t.btnText }}
            >
              {store.name.charAt(0)}
            </div>
          )}
          <span className="truncate">{store.name}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {activeProducts.length > 5 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: t.productMeta }} />
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="h-8 pl-7 pr-7 rounded-full text-xs border focus:outline-none focus:ring-1 w-28 sm:w-40 transition-all"
                style={{
                  background: t.cardBg,
                  borderColor: t.cardBorder,
                  color: t.pageText,
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  style={{ color: t.productMeta }}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
          <a
            href="#all-products"
            className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70 p-2"
            style={{ color: t.accent }}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Shop</span>
          </a>
          <button
            onClick={() => handleContactClick()}
            className="text-sm font-medium transition-opacity hover:opacity-70 p-2"
            style={{ color: t.accent }}
          >
            Contact
          </button>
        </div>
      </div>

      {/* Main content – rendered sections */}
      <main className="flex-1 mx-auto w-full max-w-7xl pt-10 pb-32 px-2 sm:px-0">
        {activeProducts.length === 0 ? (
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
          enabledSections.map(section => (
            <React.Fragment key={section.id}>
              <SectionRenderer section={section} ctx={ctx} />
            </React.Fragment>
          ))
        )}
      </main>

      {/* Footer */}
      <footer
        className="border-t pb-28 pt-12 text-center text-sm transition-colors duration-300 px-4"
        style={{ background: t.footerBg, borderColor: t.footerBorder, color: t.footerText }}
      >
        <p>
          Copyright &copy; {new Date().getFullYear()}{' '}
          <span className="font-semibold" style={{ color: t.pageText }}>{store.name}</span>
        </p>
        {activeUser?.plan === 'Free' ? (
          <p className="mt-2 text-xs opacity-70">
            Powered by{' '}
            <a href="https://myshoplink.site" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-2">
              MyShopLink
            </a>
          </p>
        ) : null}
      </footer>

      {/* Floating WhatsApp — always visible */}
      <button
        onClick={() => handleContactClick()}
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 sm:right-6 z-50 flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 rounded-full shadow-2xl hover:-translate-y-1 transition-all duration-300"
        style={{ background: '#25D366', color: '#FFFFFF' }}
        aria-label="Chat to Order on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="font-semibold hidden sm:inline">Chat to Order</span>
      </button>
    </div>
  );
}
