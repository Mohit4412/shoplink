'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getCurrencySymbol } from '../utils/currency';
import { getTheme, Theme } from '../utils/themes';
import { SectionConfig, StoreSettings, Product, PublicStorefrontData } from '../types';
import { HeroSection } from '../components/storefront/sections/HeroSection';
import { Nav } from '../components/storefront/Nav';
import { ProductCard } from '../components/storefront/ProductCard';
import { ThemeLayout } from '../utils/themes';
import { getProductUrl } from '../utils/storeUrl';
import { getTypographyClasses, getSectionSpacingClass } from '../utils/themeHelpers';
import { SparkStoreFront } from '../components/storefront/themes/SparkStoreFront';

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
        // Always 2 cols on mobile, 3 on sm+
        wrapperClass: 'flex flex-wrap gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10',
        itemClass: 'w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.667rem)]',
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


// ─── Section context passed to every renderer ─────────────────────────────────

interface SectionContext {
  theme: Theme;
  store: StoreSettings;
  activeProducts: Product[];
  featuredProducts: Product[];
  remainingProducts: Product[];
  currencySymbol: string;
  resolvedStoreId: string;
  isSubdomain: boolean;
  onContactClick: (product?: Product) => void;
  searchQuery: string;
  sectionSettings: Record<string, SectionConfig['settings']>;
  spacingClass: string;
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
  const typography = getTypographyClasses(theme.layout.typographyScale);
  const getProductHref = (p: Product) =>
    ctx.isSubdomain ? `/product/${p.id}` : `/${resolvedStoreId}/product/${p.id}`;
  const getItemClass = (baseClass: string, itemCount: number, isList: boolean) =>
    itemCount === 1 && !isList ? 'w-full max-w-sm mx-auto' : baseClass;

  switch (section.id) {

    // ── Hero ────────────────────────────────────────────────────────────────
    case 'hero':
      return <HeroSection theme={theme} store={store} ctaText={ctx.sectionSettings['hero']?.ctaText} />;

    // ── Featured Products ───────────────────────────────────────────────────
    case 'featured': {
      if (featuredProducts.length === 0) return null;
      const featuredHeading = ctx.sectionSettings['featured']?.heading || 'Featured Highlights';
      const { wrapperClass, itemClass, isList } = getGridClasses(theme.layout.productGrid);
      return (
        <section id="products" className={`${ctx.spacingClass} px-4 sm:px-6 lg:px-8`}>
          <h2 className={`${typography.sectionHeading} mb-6 md:text-center`} style={{ color: t.sectionHeading }}>
            {featuredHeading}
          </h2>
          <div className={`${wrapperClass} ${!isList ? 'justify-start md:justify-center' : ''}`}>
            {featuredProducts.map(product => (
              <div key={product.id} className={getItemClass(itemClass, featuredProducts.length, isList)}>
                <ProductCard
                  product={product}
                  href={getProductHref(product)}
                  tokens={t}
                  cardAnatomy={theme.layout.cardAnatomy}
                  cardStyle={theme.layout.cardStyle}
                  typography={typography}
                  currencySymbol={currencySymbol}
                  onOrder={() => onContactClick(product)}
                />
              </div>
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
      return (
        <section id="all-products" className={`${ctx.spacingClass} px-4 sm:px-6 lg:px-8`}>
          <h2 className={`${typography.sectionHeading} mb-6 md:text-center`} style={{ color: t.sectionHeading }}>
            All Products
          </h2>
          <div className={`${wrapperClass} ${!isList ? 'justify-start md:justify-center' : ''}`}>
            {displayProducts.map(product => (
              <div key={product.id} className={getItemClass(itemClass, displayProducts.length, isList)}>
                <ProductCard
                  product={product}
                  href={getProductHref(product)}
                  tokens={t}
                  cardAnatomy={theme.layout.cardAnatomy}
                  cardStyle={theme.layout.cardStyle}
                  typography={typography}
                  currencySymbol={currencySymbol}
                  onOrder={() => onContactClick(product)}
                />
              </div>
            ))}
            {displayProducts.length === 0 && (
              <div className="w-full py-20 text-center">
                <p className={`${typography.productMeta} uppercase tracking-widest font-semibold`} style={{ color: t.productMeta }}>
                  {q ? `No products match "${ctx.searchQuery}"` : 'No products available yet'}
                </p>
              </div>
            )}
          </div>
        </section>
      );
    }

    // ── About ───────────────────────────────────────────────────────────────
    case 'about': {
      const aboutHeading = ctx.sectionSettings['about']?.heading || `About ${store.name}`;
      const aboutSubtext = ctx.sectionSettings['about']?.subtext || store.bio || store.tagline || 'We are passionate about bringing you the best products, curated with care and delivered with love.';
      return (
        <section className={`${ctx.spacingClass} px-4 sm:px-6 lg:px-8`}>
          <div
            className="rounded-3xl p-10 md:p-16 text-center max-w-3xl mx-auto"
            style={{ background: t.accentLight, border: `1px solid ${t.cardBorder}` }}
          >
            <h2 className={`${typography.sectionHeading} mb-4`} style={{ color: t.sectionHeading }}>
              {aboutHeading}
            </h2>
            <p className="text-base md:text-lg leading-relaxed" style={{ color: t.heroSub }}>
              {aboutSubtext}
            </p>
          </div>
        </section>
      );
    }

    // ── WhatsApp CTA ────────────────────────────────────────────────────────
    case 'whatsapp-cta': {
      const ctaHeading = ctx.sectionSettings['whatsapp-cta']?.heading || "Questions? We're on WhatsApp 💬";
      const ctaSubtext = ctx.sectionSettings['whatsapp-cta']?.subtext || 'Chat with us directly to place an order, ask about availability, or get help.';
      return (
        <section className={`${ctx.spacingClass} px-4 sm:px-6 lg:px-8`}>
          <div
            className="rounded-3xl p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6"
            style={{ background: '#25D36615', border: '1px solid #25D36630' }}
          >
            <div>
              <h2 className={`${typography.sectionHeading} mb-2`} style={{ color: t.sectionHeading }}>
                {ctaHeading}
              </h2>
              <p className="text-sm" style={{ color: t.productMeta }}>
                {ctaSubtext}
              </p>
            </div>
            <button
              onClick={() => onContactClick()}
              className="shrink-0 flex items-center gap-3 px-6 py-3.5 rounded-full text-white font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-all duration-200 min-h-[44px]"
              style={{ background: '#25D366' }}
            >
              <MessageCircle className="w-5 h-5" />
              {ctx.sectionSettings['whatsapp-cta']?.ctaText || 'Chat to Order'}
            </button>
          </div>
        </section>
      );
    }

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
  const isSubdomain = typeof window !== 'undefined'
    ? window.location.hostname.split('.').length >= 3
    : Boolean(publicUser?.username && !storeId);
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
  const activeProducts = products.filter(p => p.status === 'Active');
  const isMismatch = !storefront && localUser && resolvedStoreId && resolvedStoreId !== localUser.username;

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
    isSubdomain,
    onContactClick: handleContactClick,
    searchQuery,
    sectionSettings: Object.fromEntries(rawSections.map(s => [s.id, s.settings ?? {}])),
    spacingClass: getSectionSpacingClass(theme.layout.sectionSpacing),
  };

  return (
    <div className="min-h-screen sm:bg-gray-100 sm:flex sm:justify-center sm:items-start font-sans">
      <div
        className="w-full sm:max-w-[480px] sm:min-h-screen sm:shadow-2xl flex flex-col transition-colors duration-300 relative"
        style={{ background: t.pageBg, color: t.pageText }}
      >
      {/* Demo banner */}
      {isMismatch && (
        <div className="bg-amber-100 text-amber-900 px-4 py-2 text-center text-[10px] font-bold uppercase tracking-widest">
          Demo Mode: Viewing {resolvedStoreId}
        </div>
      )}

      {/* Theme-aware Nav */}
      <Nav
        theme={theme}
        store={store}
        storeHref={isSubdomain ? '/' : `/${resolvedStoreId}`}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* ── Spark variant — category tabs + Instagram grid ── */}
      {theme.layout.variant === 'spark' ? (
        <SparkStoreFront
          theme={theme}
          store={store}
          products={products}
          resolvedStoreId={resolvedStoreId}
          isSubdomain={isSubdomain}
          onContactClick={handleContactClick}
        />
      ) : (
        <>
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
            className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 sm:right-[max(1rem,calc(50%-224px))] z-50 flex items-center gap-3 px-4 py-3 rounded-full shadow-2xl hover:-translate-y-1 transition-all duration-300"
            style={{ background: '#25D366', color: '#FFFFFF' }}
            aria-label="Chat to Order on WhatsApp"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </>
      )}
      </div>
    </div>
  );
}
