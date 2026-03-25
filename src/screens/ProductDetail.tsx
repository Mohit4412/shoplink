'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, ShieldCheck, Truck, Star, Award, Heart, RotateCcw, Box, Package, Zap, CreditCard, Clock, Lock, Headphones, Gift, Leaf, ThumbsUp, Flame, BadgeCheck, Sparkles, Smile, MapPin, Globe, Recycle, Tag, Percent, Handshake } from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  ShieldCheck, CheckCircle2, BadgeCheck, Truck, Package, Box, RotateCcw, Recycle,
  CreditCard, Lock, Award, Star, Sparkles, Flame, Zap, Clock, Headphones,
  Heart, ThumbsUp, Smile, Gift, Tag, Percent, Leaf, Globe, MapPin, Handshake,
};
import { useStore } from '../context/StoreContext';
import { getCurrencySymbol } from '../utils/currency';
import { getTheme } from '../utils/themes';
import { ProductCarousel } from '../components/product/ProductCarousel';
import { FloatingWhatsApp } from '../components/product/FloatingWhatsApp';
import { ProductAccordion } from '../components/product/ProductAccordion';
import { ProductActions } from '../components/product/ProductActions';
import { PublicStorefrontData } from '../types';

export function ProductDetail({ storefront }: { storefront?: PublicStorefrontData }) {
  const params = useParams<{ storeId: string; productId: string }>();
  const router = useRouter();
  const storeId = params?.storeId as string;
  const productId = params?.productId as string;

  const { store: localStore, products: localProducts, user: localUser, trackWhatsAppClick } = useStore();
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

  const { tokens: t } = getTheme(activeUser?.plan === 'Free' ? 'classic' : store.theme);

  const product = products.find((item) => item.id === productId && item.status === 'Active');

  const relatedProducts = useMemo(
    () => products.filter((item) => item.status === 'Active' && item.id !== productId).slice(0, 4),
    [productId, products]
  );

  useEffect(() => {
    if (!product) {
      router.replace(`/${resolvedStoreId}`);
    } else {
      document.title = `${product.name} | ${store.name}`;
    }
  }, [product, resolvedStoreId, router, store.name]);

  if (!product) return null;

  const currencySymbol = getCurrencySymbol(store.currency);
  const images = product.images?.length ? product.images : [product.imageUrl];
  const reviewsCount = product.reviews?.length || 128;
  const rating = product.reviews?.length && product.reviews[0].rating ? product.reviews[0].rating : 4.8;
  const phoneNumber = activeUser?.whatsappNumber.replace(/\D/g, '') || '';
  const features = product.highlights?.length ? product.highlights : [
    'Premium quality materials',
    'Hand-checked before shipping',
    'Authentic merchant product',
  ];

  const tBadges = store.trustBadges || [
    { text: '7-Day Easy Returns', icon: 'ShieldCheck' },
    { text: 'Top Rated Seller', icon: 'CheckCircle2' },
    { text: 'Fast Free Shipping', icon: 'Truck' }
  ];

  // Gracefully handle older string tuples
  const normalizedBadges = tBadges.map((b: any, idx) => {
    if (typeof b === 'string') return { text: b, icon: ['ShieldCheck', 'CheckCircle2', 'Truck'][idx] };
    return b;
  });

  const TRUST_BADGES = normalizedBadges.map((b) => {
    const IconComp = ICON_MAP[b.icon] || ShieldCheck;
    return {
      icon: <IconComp className="w-4 h-4" style={{ color: t.accent }} />,
      text: b.text,
    };
  });

  return (
    <div
      className="min-h-screen flex flex-col font-sans transition-colors duration-300"
      style={{ background: t.pageBg, color: t.pageText }}
    >
      {/* Sticky Nav */}
      <div
        className="sticky top-0 z-50 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between transition-colors duration-300"
        style={{ background: t.navBg, borderColor: t.navBorder }}
      >
        <Link
          href={`/${resolvedStoreId}`}
          className="font-bold text-lg tracking-tight flex items-center gap-3 transition-opacity hover:opacity-80"
          style={{ color: t.navText }}
        >
          {store.logoUrl ? (
            <img src={store.logoUrl} alt={store.name} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
              style={{ background: t.accent, color: t.btnText }}
            >
              {store.name.charAt(0)}
            </div>
          )}
          {store.name}
        </Link>
        <Link
          href={`/${resolvedStoreId}`}
          className="text-sm font-medium hidden sm:block transition-opacity hover:opacity-70"
          style={{ color: t.accent }}
        >
          View All Products
        </Link>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-16 flex-1 pb-32">
        {/* Breadcrumb */}
        <nav className="mb-6 lg:mb-10 text-xs sm:text-sm font-medium tracking-wide" style={{ color: t.productMeta }}>
          <Link href={`/${resolvedStoreId}`} className="transition-opacity hover:opacity-80" style={{ color: t.accent }}>
            Store Home
          </Link>
          <span className="mx-2 opacity-40">/</span>
          <span style={{ color: t.productMeta }}>{product.category}</span>
          <span className="mx-2 opacity-40">/</span>
          <span className="line-clamp-1" style={{ color: t.pageText }}>{product.name}</span>
        </nav>

        {/* Main layout */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 xl:gap-20">

          {/* Images */}
          <section className="flex-1 w-full lg:max-w-3xl lg:sticky lg:top-8 h-fit">
            <ProductCarousel images={images} productName={product.name} />
          </section>

          {/* Details */}
          <section className="flex-1 w-full flex flex-col">

            {/* Stars + Title */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-current' : 'opacity-20'}`} />
                  ))}
                </div>
                <span className="text-sm font-semibold" style={{ color: t.pageText }}>{rating}</span>
                <span className="text-xs font-medium" style={{ color: t.productMeta }}>({reviewsCount} reviews)</span>
              </div>
              <h1
                className="text-3xl sm:text-4xl md:text-[42px] font-extrabold tracking-tight leading-[1.1]"
                style={{ color: t.heroHeading }}
              >
                {product.name}
              </h1>
            </div>

            {/* Price + WhatsApp CTA */}
            <div onClick={() => trackWhatsAppClick(product.id, resolvedStoreId)}>
              <ProductActions
                productName={product.name}
                price={product.price}
                compareAtPrice={product.price * 1.25}
                variants={[]}
                stockQuantity={product.stock}
                whatsAppNumber={phoneNumber}
                currencySymbol={currencySymbol}
                storeName={store.name}
                accentColor={t.accent}
              />
            </div>

            {/* Trust Badges */}
            {TRUST_BADGES.filter(b => b.text.trim() !== '').length > 0 && (
              <div
                className="flex flex-row items-center justify-around gap-2 mb-8 py-3 px-2 border-y"
                style={{ borderColor: t.cardBorder }}
              >
                {TRUST_BADGES.filter(b => b.text.trim() !== '').map((badge, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1 min-w-0">
                    <div className="shrink-0">{badge.icon}</div>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wide text-center leading-tight line-clamp-2 max-w-[72px]"
                      style={{ color: t.productMeta }}
                    >
                      {badge.text}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Key Features */}
            <div className="mb-10">
              <h3
                className="text-sm font-bold uppercase tracking-widest mb-4"
                style={{ color: t.sectionHeading }}
              >
                Key Features
              </h3>
              <ul className="space-y-3">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-sm" style={{ color: t.productMeta }}>
                    <span className="mr-3 font-bold" style={{ color: t.accent }}>•</span>
                    <span className="leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <ProductAccordion description={product.description} />
          </section>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div
            className="mt-24 lg:mt-32 pt-16 border-t"
            style={{ borderColor: t.cardBorder }}
          >
            <h2
              className="text-2xl md:text-3xl font-bold tracking-tight mb-10 text-center"
              style={{ color: t.sectionHeading }}
            >
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {relatedProducts.map((prod) => (
                <div key={prod.id} className="group flex flex-col">
                  <Link
                    href={`/${resolvedStoreId}/product/${prod.id}`}
                    className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl mb-3"
                    style={{ background: t.cardImageBg }}
                  >
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity" />
                  </Link>
                  <div className="flex flex-col gap-0.5 px-1">
                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: t.productMeta }}>
                      {prod.category}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/${resolvedStoreId}/product/${prod.id}`}
                        className="text-sm font-bold line-clamp-1 truncate pr-2 transition-opacity hover:opacity-70"
                        style={{ color: t.productName }}
                      >
                        {prod.name}
                      </Link>
                      <span className="text-sm font-extrabold shrink-0" style={{ color: t.productPrice }}>
                        {currencySymbol}{prod.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating WhatsApp */}
      <div onClick={() => trackWhatsAppClick(product.id, resolvedStoreId)}>
        <FloatingWhatsApp phoneNumber={phoneNumber} productName={product.name} storeName={store.name} />
      </div>

      {/* Footer */}
      <footer
        className="border-t py-12 text-center text-sm mt-16 transition-colors duration-300"
        style={{ background: t.footerBg, borderColor: t.footerBorder, color: t.footerText }}
      >
        <p>
          Copyright &copy; {new Date().getFullYear()}{' '}
          <span className="font-semibold" style={{ color: t.pageText }}>{store.name}</span>
        </p>
        {activeUser?.plan === 'Free' ? (
          <p className="mt-2 text-xs opacity-60 italic">Powered by MyShopLink</p>
        ) : null}
      </footer>
    </div>
  );
}
