'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getCurrencySymbol } from '../utils/currency';
import { getTheme, Theme } from '../utils/themes';
import { StoreSettings, Product, PublicStorefrontData } from '../types';
import { Nav } from '../components/storefront/Nav';
import { ProductCard } from '../components/storefront/ProductCard';
import { ThemeLayout } from '../utils/themes';
import { getProductUrl, getStoreSubdomain, isStoreHostedAtRoot } from '../utils/storeUrl';
import { getTypographyClasses, getSectionSpacingClass } from '../utils/themeHelpers';
import { SparkStoreFront } from '../components/storefront/themes/SparkStoreFront';
import { CraftStoreFront } from '../components/storefront/themes/CraftStoreFront';
import { FreshStoreFront } from '../components/storefront/themes/FreshStoreFront';
import { SwiftStoreFront } from '../components/storefront/themes/SwiftStoreFront';
import { NoirStoreFront } from '../components/storefront/themes/NoirStoreFront';
import { StoreFooter } from '../components/storefront/StoreFooter';
import { OrderRequestModal, PublicOrderRequestInput } from '../components/storefront/OrderRequestModal';

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

// ─── Classic theme layout ─────────────────────────────────────────────────────

interface ClassicLayoutProps {
  theme: Theme;
  store: StoreSettings;
  activeProducts: Product[];
  currencySymbol: string;
  resolvedStoreId: string;
  isSubdomain: boolean;
  onContactClick: (product?: Product) => void;
  onOrderClick: (product: Product) => void;
  searchQuery: string;
}

function ClassicLayout({
  theme, store, activeProducts, currencySymbol, resolvedStoreId, isSubdomain, onContactClick, onOrderClick, searchQuery,
}: ClassicLayoutProps) {
  const t = theme.tokens;
  const typography = getTypographyClasses(theme.layout.typographyScale);
  const spacingClass = getSectionSpacingClass(theme.layout.sectionSpacing);
  const { wrapperClass, itemClass, isList } = getGridClasses(theme.layout.productGrid);

  const getProductHref = (p: Product) =>
    isSubdomain ? `/product/${p.id}` : `/${resolvedStoreId}/product/${p.id}`;

  const getItemClass = (baseClass: string, itemCount: number) =>
    itemCount === 1 && !isList ? 'w-full max-w-sm mx-auto' : baseClass;

  // Featured: top 4 when there are more than 4 products
  const featuredProducts = activeProducts.length > 4 ? activeProducts.slice(0, 4) : [];
  const remainingProducts = featuredProducts.length > 0
    ? activeProducts.filter(p => !featuredProducts.some(f => f.id === p.id))
    : activeProducts;

  const q = searchQuery.toLowerCase().trim();
  const displayProducts = q
    ? remainingProducts.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    : remainingProducts;

  return (
    <main className="flex-1 w-full pt-10 pb-32 px-2 sm:px-0">
      {activeProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: t.accentLight }}>
            <MessageCircle className="w-10 h-10" style={{ color: t.accent }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: t.heroHeading }}>No products yet</h2>
          <p className="text-sm max-w-xs" style={{ color: t.heroSub }}>
            {store.name} is setting up their store. Check back soon!
          </p>
        </div>
      ) : (
        <>
          {/* Featured section — only when >4 products */}
          {featuredProducts.length > 0 && (
            <section id="products" className={`${spacingClass} px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full`}>
              <h2 className={`${typography.sectionHeading} mb-6 md:text-center`} style={{ color: t.sectionHeading }}>
                Featured Highlights
              </h2>
              <div className={`${wrapperClass} ${!isList ? 'justify-start md:justify-center' : ''}`}>
                {featuredProducts.map(product => (
                  <div key={product.id} className={getItemClass(itemClass, featuredProducts.length)}>
                    <ProductCard
                      product={product}
                      href={getProductHref(product)}
                      tokens={t}
                      cardAnatomy={theme.layout.cardAnatomy}
                      cardStyle={theme.layout.cardStyle}
                      typography={typography}
                      currencySymbol={currencySymbol}
                      onOrder={() => onOrderClick(product)}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* All products */}
          <section id="all-products" className={`${spacingClass} px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full`}>
            <h2 className={`${typography.sectionHeading} mb-6 md:text-center`} style={{ color: t.sectionHeading }}>
              All Products
            </h2>
            <div className={`${wrapperClass} ${!isList ? 'justify-start md:justify-center' : ''}`}>
              {displayProducts.map(product => (
                <div key={product.id} className={getItemClass(itemClass, displayProducts.length)}>
                  <ProductCard
                    product={product}
                    href={getProductHref(product)}
                    tokens={t}
                    cardAnatomy={theme.layout.cardAnatomy}
                    cardStyle={theme.layout.cardStyle}
                    typography={typography}
                    currencySymbol={currencySymbol}
                    onOrder={() => onOrderClick(product)}
                  />
                </div>
              ))}
              {displayProducts.length === 0 && (
                <div className="w-full py-20 text-center">
                  <p className={`${typography.productMeta} uppercase tracking-widest font-semibold`} style={{ color: t.productMeta }}>
                    {q ? `No products match "${searchQuery}"` : 'No products available yet'}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* About — only when bio is set */}
          {store.bio && (
            <section className={`${spacingClass} px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full`}>
              <div
                className="rounded-3xl p-10 md:p-16 text-center max-w-3xl mx-auto"
                style={{ background: t.accentLight, border: `1px solid ${t.cardBorder}` }}
              >
                <h2 className={`${typography.sectionHeading} mb-4`} style={{ color: t.sectionHeading }}>
                  About {store.name}
                </h2>
                <p className="text-base md:text-lg leading-relaxed" style={{ color: t.heroSub }}>
                  {store.bio}
                </p>
              </div>
            </section>
          )}

          {/* WhatsApp CTA */}
          <section className={`${spacingClass} px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full`}>
            <div
              className="rounded-3xl p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6"
              style={{ background: '#25D36615', border: '1px solid #25D36630' }}
            >
              <div>
                <h2 className={`${typography.sectionHeading} mb-2`} style={{ color: t.sectionHeading }}>
                  Questions? We&apos;re on WhatsApp 💬
                </h2>
                <p className="text-sm" style={{ color: t.productMeta }}>
                  Chat with us directly to place an order, ask about availability, or get help.
                </p>
              </div>
              <button
                onClick={() => onContactClick()}
                className="shrink-0 flex items-center gap-3 px-6 py-3.5 rounded-full text-white font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-all duration-200 min-h-[44px]"
                style={{ background: '#25D366' }}
              >
                <MessageCircle className="w-5 h-5" />
                Chat to Order
              </button>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

// ─── StoreFront ───────────────────────────────────────────────────────────────

export function StoreFront({ storefront }: { storefront?: PublicStorefrontData }) {
  const params = useParams<{ storeId: string }>();
  const storeId = params?.storeId as string;
  const { store: localStore, products: localProducts, user: localUser, trackStoreView, trackWhatsAppClick } = useStore();
  const publicUser = storefront?.user;
  const store = storefront?.store ?? localStore;
  const products = storefront?.products ?? localProducts;

  const runtimeSubdomain = typeof window !== 'undefined'
    ? getStoreSubdomain(window.location.hostname)
    : null;
  const resolvedStoreId = storeId || runtimeSubdomain || publicUser?.username || localUser?.username || 'store';
  const isStoreRootHost = typeof window !== 'undefined'
    ? isStoreHostedAtRoot(window.location.hostname)
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

  const currencySymbol = getCurrencySymbol(store.currency);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => { trackStoreView(resolvedStoreId); }, [resolvedStoreId, trackStoreView]);

  const buildWhatsAppUrl = (product?: Product, orderRequest?: PublicOrderRequestInput) => {
    const phone = activeUser?.whatsappNumber.replace(/\D/g, '') || '';
    if (product) {
      const productLink = `${typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL ?? 'https://myshoplink.site')}/p/${resolvedStoreId}--${product.id}`;
      const inStock = product.stock > 0 ? '' : '\n⚠️ Please confirm availability.';
      const customerBlock = orderRequest
        ? `\nQuantity: ${orderRequest.quantity}` +
          `\nCustomer: ${orderRequest.customerName}` +
          `\nPhone: ${orderRequest.customerPhone}` +
          (orderRequest.city ? `\nCity: ${orderRequest.city}` : '') +
          `\nPreferred payment: ${orderRequest.paymentMethod}`
        : '';
      const noteBlock = orderRequest?.notes ? `\nNotes: ${orderRequest.notes}` : '';
      const message =
        `Hi ${store.name}! 👋\n\n` +
        `I'd like to order:\n` +
        `*${product.name}*\n` +
        `Price: ${currencySymbol}${product.price.toFixed(2)}` +
        customerBlock +
        noteBlock +
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

  const openOrderRequest = (product: Product) => {
    setSelectedProduct(product);
  };

  const submitOrderRequest = async (input: PublicOrderRequestInput) => {
    if (!selectedProduct) {
      return;
    }

    if (publicUser?.username) {
      const response = await fetch(`/api/stores/${publicUser.username}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity: input.quantity,
          revenue: selectedProduct.price * input.quantity,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          email: input.email,
          city: input.city,
          address: input.address,
          pincode: input.pincode,
          paymentMethod: input.paymentMethod,
          notes: input.notes,
          selectedVariants: input.selectedVariants,
          source: 'website',
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || 'Could not send your order request.');
      }

      if (payload?.paymentProvider === 'stripe' && payload?.checkoutUrl) {
        window.location.assign(payload.checkoutUrl);
        return;
      }
    }

    trackWhatsAppClick(selectedProduct.id, resolvedStoreId);
    window.open(buildWhatsAppUrl(selectedProduct, input), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen font-sans">
      <div
        className="w-full min-h-screen flex flex-col transition-colors duration-300 relative"
        style={{ background: t.pageBg, color: t.pageText }}
      >
        {/* Demo banner */}
        {isMismatch && (
          <div className="bg-amber-100 text-amber-900 px-4 py-2 text-center text-[10px] font-bold uppercase tracking-widest">
            Demo Mode: Viewing {resolvedStoreId}
          </div>
        )}

        {/* Announcement bar */}
        {store.announcementBar?.trim() && (
          <div className="px-4 py-2 text-center text-xs font-semibold" style={{ background: t.accent, color: t.btnText }}>
            {store.announcementBar}
          </div>
        )}

        {/* Theme-aware Nav */}
        <Nav
          theme={theme}
          store={store}
          storeHref={isStoreRootHost ? '/' : `/${resolvedStoreId}`}
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
            isSubdomain={isStoreRootHost}
            onContactClick={handleContactClick}
            onOrderClick={openOrderRequest}
            isFreePlan={activeUser?.plan === 'Free'}
            searchQuery={searchQuery}
          />
        ) : theme.layout.variant === 'craft' ? (
          <CraftStoreFront
            theme={theme}
            store={store}
            products={products}
            resolvedStoreId={resolvedStoreId}
            isSubdomain={isStoreRootHost}
            onContactClick={handleContactClick}
            onOrderClick={openOrderRequest}
            isFreePlan={activeUser?.plan === 'Free'}
          />
        ) : theme.layout.variant === 'fresh' ? (
          <FreshStoreFront
            theme={theme}
            store={store}
            products={products}
            resolvedStoreId={resolvedStoreId}
            isSubdomain={isStoreRootHost}
            onContactClick={handleContactClick}
            onOrderClick={openOrderRequest}
            isFreePlan={activeUser?.plan === 'Free'}
          />
        ) : theme.layout.variant === 'swift' ? (
          <SwiftStoreFront
            theme={theme}
            store={store}
            products={products}
            resolvedStoreId={resolvedStoreId}
            isSubdomain={isStoreRootHost}
            onContactClick={handleContactClick}
            onOrderClick={openOrderRequest}
            isFreePlan={activeUser?.plan === 'Free'}
          />
        ) : theme.layout.variant === 'noir' ? (
          <NoirStoreFront
            theme={theme}
            store={store}
            products={products}
            resolvedStoreId={resolvedStoreId}
            isSubdomain={isStoreRootHost}
            onContactClick={handleContactClick}
            onOrderClick={openOrderRequest}
            isFreePlan={activeUser?.plan === 'Free'}
          />
        ) : (
          <>
            <ClassicLayout
              theme={theme}
              store={store}
              activeProducts={activeProducts}
              currencySymbol={currencySymbol}
              resolvedStoreId={resolvedStoreId}
              isSubdomain={isStoreRootHost}
              onContactClick={handleContactClick}
              onOrderClick={openOrderRequest}
              searchQuery={searchQuery}
            />

            <StoreFooter store={store} theme={theme} isFreePlan={activeUser?.plan === 'Free'} />

            {/* Floating WhatsApp — always visible */}
            <button
              onClick={() => handleContactClick()}
              className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-full shadow-2xl hover:-translate-y-1 transition-all duration-300"
              style={{ background: '#25D366', color: '#FFFFFF' }}
              aria-label="Chat to Order on WhatsApp"
            >
              <MessageCircle className="w-6 h-6" />
            </button>

          </>
        )}

        <OrderRequestModal
          isOpen={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
          storeName={store.name}
          currencySymbol={currencySymbol}
          paymentSettings={store.paymentSettings}
          onSubmit={submitOrderRequest}
          onWhatsAppOnly={selectedProduct ? () => handleContactClick(selectedProduct) : undefined}
        />
      </div>
    </div>
  );
}
