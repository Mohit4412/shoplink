'use client';

import { ElementType, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  CheckCircle2, ShieldCheck, Truck, Star, Award, Heart, RotateCcw,
  Box, Package, Zap, CreditCard, Clock, Lock, Headphones, Gift, Leaf,
  ThumbsUp, Flame, BadgeCheck, Sparkles, Smile, MapPin, Globe, Recycle,
  Tag, Percent, Handshake, ChevronLeft, MessageCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getCurrencySymbol } from '../utils/currency';
import { getTheme } from '../utils/themes';
import { getStoreSubdomain, isStoreHostedAtRoot } from '../utils/storeUrl';
import { ProductCarousel } from '../components/product/ProductCarousel';
import { FloatingWhatsApp } from '../components/product/FloatingWhatsApp';
import { ProductAccordion } from '../components/product/ProductAccordion';
import { ProductActions } from '../components/product/ProductActions';
import { PublicStorefrontData, Product } from '../types';
import { OrderRequestModal, PublicOrderRequestInput } from '../components/storefront/OrderRequestModal';

const ICON_MAP: Record<string, ElementType> = {
  ShieldCheck, CheckCircle2, BadgeCheck, Truck, Package, Box, RotateCcw, Recycle,
  CreditCard, Lock, Award, Star, Sparkles, Flame, Zap, Clock, Headphones,
  Heart, ThumbsUp, Smile, Gift, Tag, Percent, Leaf, Globe, MapPin, Handshake,
};

export function ProductDetail({ storefront, productId: productIdProp }: { storefront?: PublicStorefrontData & { product?: Product }; productId?: string }) {
  const params = useParams<{ storeId: string; productId: string }>();
  const router = useRouter();
  const storeId = params?.storeId as string;
  const productId = productIdProp ?? params?.productId as string;

  const { store: localStore, products: localProducts, user: localUser, trackWhatsAppClick } = useStore();
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

  const storeHref = isStoreRootHost ? '/' : `/${resolvedStoreId}`;
  const productHref = (id: string) => isStoreRootHost ? `/product/${id}` : `/${resolvedStoreId}/product/${id}`;

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
    if (!productId) return; // params not yet resolved during hydration
    if (!product) {
      router.replace(storeHref);
    } else {
      document.title = `${product.name} | ${store.name}`;
    }
  }, [product, productId, storeHref, router, store.name]);

  if (!productId || !product) return null;

  const currencySymbol = getCurrencySymbol(store.currency);
  const images = product.images?.length ? product.images : [product.imageUrl];
  const reviewsCount = product.reviews?.length || 128;
  const rating = product.reviews?.length && product.reviews[0].rating ? product.reviews[0].rating : 4.8;
  const phoneNumber = activeUser?.whatsappNumber.replace(/\D/g, '') || '';
  const generalWhatsAppMessage = encodeURIComponent(`Hi ${store.name}! 👋 I'm browsing your store and have a quick question.`);
  const generalWhatsAppUrl = phoneNumber ? `https://wa.me/${phoneNumber}?text=${generalWhatsAppMessage}` : '#';
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
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const buildWhatsAppUrl = (orderRequest?: PublicOrderRequestInput) => {
    const productLink = `${typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL ?? 'https://myshoplink.site')}/p/${resolvedStoreId}--${product.id}`;
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
      `\n\nPlease confirm and let me know how to proceed. 🙏`;

    return phoneNumber ? `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}` : '#';
  };

  const submitOrderRequest = async (input: PublicOrderRequestInput) => {
    if (publicUser?.username) {
      const response = await fetch(`/api/stores/${publicUser.username}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity: input.quantity,
          revenue: product.price * input.quantity,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          email: input.email,
          city: input.city,
          address: input.address,
          pincode: input.pincode,
          paymentMethod: input.paymentMethod,
          notes: input.notes,
          source: 'website',
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || 'Could not send your order request.');
      }
    }

    trackWhatsAppClick(product.id, resolvedStoreId);
    window.open(buildWhatsAppUrl(input), '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="min-h-screen font-sans">
      <div className="w-full min-h-screen flex flex-col" style={{ background: t.pageBg, color: t.pageText }}>

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
        <a
          href={generalWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold shrink-0 ml-2 min-h-[44px] flex items-center gap-1.5"
          style={{ color: t.accent }}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Chat
        </a>
      </div>

      <main className="flex-1 pb-28">

        {/* Image carousel — full width on mobile, constrained on desktop */}
        <div className="w-full lg:hidden">
          <ProductCarousel images={images} productName={product.name} />
        </div>

        {/* Product info — padded content below image */}
        <div className="px-4 pt-5 max-w-2xl mx-auto lg:px-8 lg:max-w-7xl lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
          {/* Desktop-only carousel inside grid */}
          <div className="hidden lg:block lg:sticky lg:top-[56px]">
            <ProductCarousel images={images} productName={product.name} />
          </div>
          <div>
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
          <div>
            <ProductActions
              price={product.price}
              compareAtPrice={product.price * 1.25}
              variants={[]}
              stockQuantity={product.stock}
              currencySymbol={currencySymbol}
              accentColor={t.accent}
              onOrder={() => setIsOrderModalOpen(true)}
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
          <ProductAccordion
            description={product.description}
            detailsTitle={product.pageSections?.detailsTitle || store.productAccordionDefaults?.detailsTitle}
            shippingTitle={product.pageSections?.shippingTitle || store.productAccordionDefaults?.shippingTitle}
            shippingContent={product.pageSections?.shippingContent}
            careTitle={product.pageSections?.careTitle || store.productAccordionDefaults?.careTitle}
            careContent={product.pageSections?.careContent}
          />

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
          </div>{/* end right column */}
        </div>
      </main>

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
      </div>

      <OrderRequestModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        product={product}
        storeName={store.name}
        currencySymbol={currencySymbol}
        onSubmit={submitOrderRequest}
        onWhatsAppOnly={phoneNumber ? () => window.open(buildWhatsAppUrl(), '_blank', 'noopener,noreferrer') : undefined}
      />
    </>
  );
}
