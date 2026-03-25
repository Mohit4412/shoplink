'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  CheckCircle2, ShieldCheck, Truck, Star, Award, Heart, RotateCcw,
  Box, Package, Zap, CreditCard, Clock, Lock, Headphones, Gift, Leaf,
  ThumbsUp, Flame, BadgeCheck, Sparkles, Smile, MapPin, Globe, Recycle,
  Tag, Percent, Handshake, ChevronLeft,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getCurrencySymbol } from '../utils/currency';
import { getTheme } from '../utils/themes';
import { ProductCarousel } from '../components/product/ProductCarousel';
import { FloatingWhatsApp } from '../components/product/FloatingWhatsApp';
import { ProductAccordion } from '../components/product/ProductAccordion';
import { ProductActions } from '../components/product/ProductActions';
import { PublicStorefrontData } from '../types';

const ICON_MAP: Record<string, React.ElementType> = {
  ShieldCheck, CheckCircle2, BadgeCheck, Truck, Package, Box, RotateCcw, Recycle,
  CreditCard, Lock, Award, Star, Sparkles, Flame, Zap, Clock, Headphones,
  Heart, ThumbsUp, Smile, Gift, Tag, Percent, Leaf, Globe, MapPin, Handshake,
};

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
  const isSubdomain = typeof window !== 'undefined'
    ? window.location.hostname.split('.').length >= 3
    : Boolean(publicUser?.username && !storeId);

  const storeHref = isSubdomain ? '/' : `/${resolvedStoreId}`;
  const productHref = (id: string) => isSubdomain ? `/product/${id}` : `/${resolvedStoreId}/product/${id}`;

  const activeUser = publicUser ?? (
    localUser ? { username: localUser.username, whatsappNumber: localUser.whatsappNumber, plan: localUser.plan } : null
  );

  const { tokens: t } = getTheme(activeUser?.plan === 'Free' ? 'classic' : store.theme);

  const product = products.find((item) => item.id === productId && item.status === 'Active');
  const relatedProducts = useMemo(
    () => products.filter((item) => item.status === 'Active' && item.id !== productId).slice(0, 4),
    [productId, products]
  );

  useEffect(() => {
    if (!product) {
      router.replace(storeHref);
    } else {
      document.title = `${product.name} | ${store.name}`;
    }
  }, [product, storeHref, router, store.name]);

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
    { text: 'Fast Free Shipping', icon: 'Truck' },
  ];
  const normalizedBadges = tBadges.map((b: any, idx) =>
    typeof b === 'string' ? { text: b, icon: ['ShieldCheck', 'CheckCircle2', 'Truck'][idx] } : b
  );
  const TRUST_BADGES = normalizedBadges.map((b) => {
    const IconComp = ICON_MAP[b.icon] || ShieldCheck;
    return { icon: <IconComp className="w-4 h-4" style={{ color: t.accent }} />, text: b.text };
  });
  const activeBadges = TRUST_BADGES.filter(b => b.text.trim() !== '');

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: t.pageBg, color: t.pageText }}>

      {/* Nav — compact on mobile */}
      <div
        className="sticky top-0 z-50 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between"
        style={{ background: t.navBg, borderColor: t.navBorder }}
      >
        <Link
          href={storeHref}
          className="flex items-center gap-2 min-w-0 transition-opacity hover:opacity-80"
          style={{ color: t.navText }}
        >
          <ChevronLeft className="w-5 h-5 shrink-0" />
          {store.logoUrl ? (
            <img src={store.logoUrl} alt={store.name} className="h-7 w-7 rounded-full object-cover shrink-0" />
          ) : (
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={{ background: t.accent, color: t.btnText }}
            >
              {store.name.charAt(0)}
            </div>
          )}
          <span className="font-bold text-sm truncate max-w-[140px]">{store.name}</span>
        </Link>
        <Link
          href={storeHref}
          className="text-xs font-semibold shrink-0 ml-2"
          style={{ color: t.accent }}
        >
          All Products
        </Link>
      </div>

      <main className="flex-1 pb-28">

        {/* Image carousel — full width, no side padding on mobile */}
        <div className="w-full">
          <ProductCarousel images={images} productName={product.name} />
        </div>

        {/* Product info — padded content below image */}
        <div className="px-4 pt-5 max-w-2xl mx-auto lg:max-w-7xl">

          {/* Category + title */}
          <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: t.productMeta }}>
            {product.category}
          </p>
          <h1
            className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight mb-3"
            style={{ color: t.heroHeading }}
          >
            {product.name}
          </h1>

          {/* Stars */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'fill-current' : 'opacity-20'}`} />
              ))}
            </div>
            <span className="text-sm font-semibold" style={{ color: t.pageText }}>{rating}</span>
            <span className="text-xs" style={{ color: t.productMeta }}>({reviewsCount} reviews)</span>
          </div>

          {/* Price + CTA */}
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
          {activeBadges.length > 0 && (
            <div
              className="flex flex-row items-center justify-around gap-1 mb-7 py-3 border-y"
              style={{ borderColor: t.cardBorder }}
            >
              {activeBadges.map((badge, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 min-w-0 px-1">
                  <div className="shrink-0">{badge.icon}</div>
                  <span
                    className="text-[9px] font-semibold uppercase tracking-wide text-center leading-tight line-clamp-2 max-w-[64px]"
                    style={{ color: t.productMeta }}
                  >
                    {badge.text}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Key Features */}
          {features.length > 0 && (
            <div className="mb-7">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: t.sectionHeading }}>
                Key Features
              </h3>
              <ul className="space-y-2">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-sm" style={{ color: t.productMeta }}>
                    <span className="mr-2.5 font-bold shrink-0" style={{ color: t.accent }}>•</span>
                    <span className="leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Description accordion */}
          <ProductAccordion description={product.description} />

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-10 pt-8 border-t" style={{ borderColor: t.cardBorder }}>
              <h2 className="text-base font-bold tracking-tight mb-5" style={{ color: t.sectionHeading }}>
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {relatedProducts.map((prod) => (
                  <div key={prod.id} className="group flex flex-col">
                    <Link
                      href={productHref(prod.id)}
                      className="relative aspect-[4/5] w-full overflow-hidden rounded-xl mb-2"
                      style={{ background: t.cardImageBg }}
                    >
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </Link>
                    <p className="text-[10px] font-medium uppercase tracking-wider mb-0.5" style={{ color: t.productMeta }}>
                      {prod.category}
                    </p>
                    <p className="text-xs font-semibold line-clamp-1" style={{ color: t.productName }}>
                      {prod.name}
                    </p>
                    <p className="text-xs font-bold mt-0.5" style={{ color: t.productPrice }}>
                      {currencySymbol}{prod.price.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating WhatsApp — hidden on mobile since the inline CTA is already visible */}
      <div className="hidden sm:block" onClick={() => trackWhatsAppClick(product.id, resolvedStoreId)}>
        <FloatingWhatsApp phoneNumber={phoneNumber} productName={product.name} storeName={store.name} />
      </div>

      {/* Footer */}
      <footer
        className="border-t py-6 text-center text-xs"
        style={{ background: t.footerBg, borderColor: t.footerBorder, color: t.footerText }}
      >
        <p>
          &copy; {new Date().getFullYear()}{' '}
          <span className="font-semibold" style={{ color: t.pageText }}>{store.name}</span>
        </p>
        {activeUser?.plan === 'Free' && (
          <p className="mt-1 opacity-50 italic">Powered by MyShopLink</p>
        )}
      </footer>
    </div>
  );
}
