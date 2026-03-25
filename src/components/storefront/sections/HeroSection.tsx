'use client';

import React, { useEffect, useRef } from 'react';
import { ShoppingBag, ChevronDown } from 'lucide-react';
import { Theme } from '../../../utils/themes';
import { StoreSettings } from '../../../types';

interface HeroSectionProps {
  theme: Theme;
  store: StoreSettings;
  ctaText?: string;
}

export function HeroSection({ theme, store, ctaText }: HeroSectionProps) {
  const { tokens: t, layout } = theme;

  // ── CENTERED ──────────────────────────────────────────────────────────────
  if (layout.heroStyle === 'centered') {
    return (
      <section
        className="flex flex-col items-center text-center mb-24 px-4 pt-4"
        style={{ background: t.heroBg }}
      >
        {/* Logo / Avatar */}
        {store.logoUrl ? (
          <img
            src={store.logoUrl}
            alt={store.name}
            className="w-28 h-28 rounded-full object-cover mb-8 shadow-lg"
            style={{ border: `3px solid ${t.cardBorder}` }}
          />
        ) : (
          <div
            className="w-28 h-28 rounded-full mb-8 flex items-center justify-center shadow-md"
            style={{ background: t.accentLight }}
          >
            <ShoppingBag className="w-10 h-10" style={{ color: t.accent }} />
          </div>
        )}

        {/* Heading */}
        <h1
          className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 leading-[1.05]"
          style={{ color: t.heroHeading }}
        >
          {store.name}
        </h1>

        {/* Tagline */}
        <p
          className="text-lg md:text-xl max-w-xl mb-10 leading-relaxed"
          style={{ color: t.heroSub }}
        >
          {store.tagline || 'Welcome to our store. Discover our premium collection.'}
        </p>

        {/* Scroll-down cue */}
        <a
          href="#products"
          aria-label="Scroll to products"
          className="flex flex-col items-center gap-1 opacity-40 hover:opacity-80 transition-opacity"
          style={{ color: t.accent }}
        >
          <span className="text-xs font-semibold uppercase tracking-widest">Explore</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </a>
      </section>
    );
  }

  // ── SPLIT ─────────────────────────────────────────────────────────────────
  if (layout.heroStyle === 'split') {
    return (
      <section className="mb-20 px-4">
        <div
          className="rounded-3xl overflow-hidden flex flex-col md:flex-row min-h-[320px]"
          style={{ background: t.accentLight, border: `1px solid ${t.cardBorder}` }}
        >
          {/* Left — logo / visual */}
          <div
            className="flex-1 flex items-center justify-center p-10 md:p-16"
            style={{ background: t.pageBg }}
          >
            {store.logoUrl ? (
              <img
                src={store.logoUrl}
                alt={store.name}
                className="w-36 h-36 rounded-full object-cover shadow-xl"
                style={{ border: `4px solid ${t.accent}22` }}
              />
            ) : (
              <div
                className="w-36 h-36 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: t.accentLight }}
              >
                <ShoppingBag className="w-14 h-14" style={{ color: t.accent }} />
              </div>
            )}
          </div>

          {/* Right — text */}
          <div className="flex-1 flex flex-col justify-center p-10 md:p-14">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3 opacity-60"
              style={{ color: t.heroSub }}
            >
              Official Store
            </p>
            <h1
              className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5 leading-tight"
              style={{ color: t.heroHeading }}
            >
              {store.name}
            </h1>
            <p
              className="text-base md:text-lg leading-relaxed mb-8 max-w-sm"
              style={{ color: t.heroSub }}
            >
              {store.tagline || 'Discover our premium collection handpicked just for you.'}
            </p>
            <a
              href="#products"
              className="inline-flex items-center gap-2 self-start px-6 py-3 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: t.btnBg, color: t.btnText }}
            >
              {ctaText || 'Shop Now'}
              <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            </a>
          </div>
        </div>
      </section>
    );
  }

  // ── FULLBLEED ─────────────────────────────────────────────────────────────
  // Uses store logo (or a generated gradient) as a full-width banner
  return (
    <section className="relative w-full h-[420px] md:h-[520px] mb-24 overflow-hidden">
      {/* Background: logo blurred fill or accent gradient */}
      {store.logoUrl ? (
        <img
          src={store.logoUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-110"
          style={{ filter: 'blur(28px) brightness(0.45) saturate(1.4)' }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${t.accent}cc 0%, ${t.pageBg} 100%)`,
          }}
        />
      )}

      {/* Gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        {store.logoUrl && (
          <img
            src={store.logoUrl}
            alt={store.name}
            className="w-20 h-20 rounded-full object-cover mb-6 shadow-2xl ring-4 ring-white/20"
          />
        )}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4 drop-shadow-lg leading-tight">
          {store.name}
        </h1>
        <p className="text-white/80 text-lg md:text-xl max-w-xl mb-10 drop-shadow-sm">
          {store.tagline || 'Discover our premium collection.'}
        </p>

        <a
          href="#products"
          className="flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold shadow-xl transition-opacity hover:opacity-90"
          style={{ background: t.btnBg, color: t.btnText }}
        >
          {ctaText || 'Browse Products'}
          <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
        </a>
      </div>

      {/* Bottom scroll cue */}
      <a
        href="#products"
        aria-label="Scroll down"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 hover:text-white/90 transition-colors"
      >
        <ChevronDown className="w-6 h-6 animate-bounce" />
      </a>
    </section>
  );
}
