'use client';


import Link from 'next/link';
import type { ThemeTokens, ThemeLayout } from '../../utils/themes';
import type { Product } from '../../types';
import type { TypographyClasses } from '../../utils/themeHelpers';

interface ProductCardProps {
  product: Product;
  href: string;
  tokens: ThemeTokens;
  cardAnatomy: ThemeLayout['cardAnatomy'];
  cardStyle: ThemeLayout['cardStyle'];
  typography: TypographyClasses;
  currencySymbol: string;
  onOrder: () => void;
}

function OutOfStock() {
  return (
    <span className="inline-flex items-center justify-center w-full py-2.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-400 min-h-[44px]">
      Out of Stock
    </span>
  );
}

function OrderButton({ onOrder, tokens }: { onOrder: () => void; tokens: ThemeTokens }) {
  return (
    <button
      type="button"
      onClick={onOrder}
      className="w-full inline-flex min-h-[44px] items-center justify-center rounded-full px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ background: tokens.waBg, color: tokens.waText }}
    >
      Order on WhatsApp
    </button>
  );
}

export function ProductCard({ product, href, tokens: t, cardAnatomy, cardStyle, typography, currencySymbol, onOrder }: ProductCardProps) {
  const outOfStock = product.stock === 0;

  // ── PORTRAIT ───────────────────────────────────────────────────────────────
  if (cardAnatomy === 'portrait') {
    const boxed = cardStyle !== 'borderless';
    return (
      <div
        className={`group flex flex-col ${boxed ? 'rounded-2xl overflow-hidden' : ''} ${cardStyle === 'floating' ? 'transition-all duration-300 hover:shadow-2xl hover:scale-[1.025]' : ''}`}
        style={boxed ? { background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow } : {}}
      >
        <Link href={href} className="relative aspect-[3/4] w-full overflow-hidden block" style={{ background: t.cardImageBg }}>
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          {outOfStock && <div className="absolute inset-0 bg-black/40 flex items-end p-3"><span className="text-white text-xs font-bold px-2 py-1 bg-black/60 rounded w-full text-center">Out of Stock</span></div>}
        </Link>
        <div className={`flex flex-col flex-1 ${boxed ? 'p-4' : 'pt-2'}`}>
          <p className={`${typography.productMeta} mb-0.5`} style={{ color: t.productMeta }}>{product.category}</p>
          <Link href={href} className={`${typography.productName} line-clamp-1 mb-1`} style={{ color: t.productName }}>{product.name}</Link>
          <p className={`${typography.priceLabel} mb-3`} style={{ color: t.productPrice }}>{currencySymbol}{product.price.toFixed(2)}</p>
          {outOfStock ? <OutOfStock /> : <OrderButton onOrder={onOrder} tokens={t} />}
        </div>
      </div>
    );
  }

  // ── LANDSCAPE ──────────────────────────────────────────────────────────────
  if (cardAnatomy === 'landscape') {
    return (
      <div
        className={`group flex flex-col rounded-2xl overflow-hidden ${cardStyle === 'floating' ? 'transition-all duration-300 hover:shadow-2xl hover:scale-[1.025]' : ''}`}
        style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}
      >
        <Link href={href} className="relative w-full overflow-hidden block" style={{ background: t.cardImageBg, minHeight: '120px', aspectRatio: '4/3' }}>
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          {outOfStock && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="text-white text-xs font-bold px-2 py-1 bg-black/60 rounded">Out of Stock</span></div>}
        </Link>
        <div className="p-3 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <Link href={href} className={`${typography.productName} line-clamp-1 flex-1`} style={{ color: t.productName }}>{product.name}</Link>
            <span className={`${typography.priceLabel} shrink-0`} style={{ color: t.productPrice }}>{currencySymbol}{product.price.toFixed(2)}</span>
          </div>
          {outOfStock ? <OutOfStock /> : <OrderButton onOrder={onOrder} tokens={t} />}
        </div>
      </div>
    );
  }

  // ── SQUARE-OVERLAY ─────────────────────────────────────────────────────────
  if (cardAnatomy === 'square-overlay') {
    return (
      <div className={`group relative aspect-square overflow-hidden rounded-2xl ${cardStyle === 'floating' ? 'transition-all duration-300 hover:shadow-2xl hover:scale-[1.025]' : ''}`} style={{ background: t.cardImageBg }}>
        <Link href={href} className="absolute inset-0 block">
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        </Link>
        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
        {/* Overlay content */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-2">
          <div>
            <Link href={href} className={`${typography.productName} line-clamp-1 text-white`}>{product.name}</Link>
            <p className={`${typography.priceLabel} text-white/90`}>{currencySymbol}{product.price.toFixed(2)}</p>
          </div>
          {outOfStock ? (
            <span className="inline-flex items-center justify-center w-full py-2 rounded-full text-xs font-semibold bg-white/20 text-white min-h-[44px]">Out of Stock</span>
          ) : (
            <button
              type="button"
              onClick={onOrder}
              className="w-full inline-flex min-h-[44px] items-center justify-center rounded-full px-4 py-2 text-sm font-bold transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              style={{ background: t.waBg, color: t.waText }}
            >
              Order on WhatsApp
            </button>
          )}
        </div>
        {outOfStock && <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded">Out of Stock</div>}
      </div>
    );
  }

  // ── EDITORIAL-ROW ──────────────────────────────────────────────────────────
  return (
    <div
      className="group flex flex-row items-center gap-3 rounded-xl overflow-hidden"
      style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}
    >
      <Link href={href} className="relative shrink-0 w-[88px] h-[88px] overflow-hidden" style={{ background: t.cardImageBg }}>
        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        {outOfStock && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="text-white text-[9px] font-bold px-1 py-0.5 bg-black/60 rounded">Out of Stock</span></div>}
      </Link>
      <div className="flex-1 min-w-0 py-3 pr-3 flex flex-col gap-1.5">
        <p className={`${typography.productMeta}`} style={{ color: t.productMeta }}>{product.category}</p>
        <Link href={href} className={`${typography.productName} line-clamp-1`} style={{ color: t.productName }}>{product.name}</Link>
        <p className={`${typography.priceLabel}`} style={{ color: t.productPrice }}>{currencySymbol}{product.price.toFixed(2)}</p>
        {outOfStock ? (
          <span className="inline-flex items-center justify-center py-1.5 px-3 rounded-full text-xs font-semibold bg-gray-100 text-gray-400 self-start min-h-[44px]">Out of Stock</span>
        ) : (
          <button
            type="button"
            onClick={onOrder}
            className="self-start inline-flex min-h-[44px] items-center px-4 py-1.5 rounded-full text-xs font-bold transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
            style={{ background: t.waBg, color: t.waText }}
          >
            Order on WhatsApp
          </button>
        )}
      </div>
    </div>
  );
}
