'use client';

import { useState, useEffect, useRef, CSSProperties } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import type { Theme } from '../../utils/themes';
import type { StoreSettings } from '../../types';

interface NavProps {
  theme: Theme;
  store: StoreSettings;
  storeHref: string;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export function Nav({ theme, store, storeHref, searchQuery = '', onSearchChange }: NavProps) {
  const { tokens: t, layout } = theme;
  const navStyle = layout.navStyle;

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (navStyle !== 'minimal') return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [navStyle]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const isTransparent = navStyle === 'minimal' && !scrolled;

  const navStyle_css: CSSProperties = {
    background: isTransparent ? 'transparent' : t.navBg,
    borderBottomColor: isTransparent ? 'transparent' : t.navBorder,
    color: t.navText,
    transition: 'background 0.25s ease, border-color 0.25s ease',
  };

  const LogoBlock = (
    <>
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
      <div className="min-w-0">
        <span className="font-bold text-sm truncate block max-w-[140px]" style={{ color: t.navText }}>
          {store.name}
        </span>
        {store.tagline && navStyle === 'centered-logo' && (
          <span className="text-[10px] truncate block max-w-[180px]" style={{ color: t.heroSub }}>
            {store.tagline}
          </span>
        )}
      </div>
    </>
  );

  // ── CENTERED-LOGO ──────────────────────────────────────────────────────────
  if (navStyle === 'centered-logo') {
    return (
      <div
        className="sticky top-0 z-50 border-b px-4 py-3 flex items-center justify-center"
        style={navStyle_css}
      >
        <Link href={storeHref} className="flex items-center gap-2 transition-opacity hover:opacity-80">
          {LogoBlock}
        </Link>
      </div>
    );
  }

  // ── INLINE-SEARCH ──────────────────────────────────────────────────────────
  if (navStyle === 'inline-search') {
    return (
      <div
        className="sticky top-0 z-50 border-b px-4 py-3 flex items-center justify-between gap-3"
        style={navStyle_css}
      >
        <Link href={storeHref} className="flex items-center gap-2 min-w-0 transition-opacity hover:opacity-80">
          {LogoBlock}
        </Link>

        {/* Desktop: inline input */}
        <div className="hidden sm:flex items-center gap-2 flex-1 max-w-[200px]">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search products…"
              value={searchQuery}
              onChange={e => onSearchChange?.(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border focus:outline-none focus:ring-2"
              style={{
                borderColor: t.navBorder,
                background: t.cardBg,
                color: t.pageText,
              }}
            />
          </div>
        </div>

        {/* Mobile: icon that expands */}
        <div className="sm:hidden flex items-center">
          {searchOpen ? (
            <div className="flex items-center gap-2">
              <input
                ref={searchRef}
                type="search"
                placeholder="Search…"
                value={searchQuery}
                onChange={e => onSearchChange?.(e.target.value)}
                className="h-8 w-36 px-2.5 text-xs rounded-lg border focus:outline-none focus:ring-2"
                style={{ borderColor: t.navBorder, background: t.cardBg, color: t.pageText }}
              />
              <button
                onClick={() => { setSearchOpen(false); onSearchChange?.(''); }}
                className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close search"
              >
                <X className="w-4 h-4" style={{ color: t.navText }} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open search"
            >
              <Search className="w-5 h-5" style={{ color: t.navText }} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── MINIMAL (default) ──────────────────────────────────────────────────────
  return (
    <div
      className="sticky top-0 z-50 border-b px-4 py-3 flex items-center justify-between gap-3"
      style={navStyle_css}
    >
      <Link href={storeHref} className="flex items-center gap-2 min-w-0 transition-opacity hover:opacity-80">
        {LogoBlock}
      </Link>
      {searchOpen ? (
        <div className="flex items-center gap-2 shrink-0">
          <input
            ref={searchRef}
            type="search"
            placeholder="Search…"
            value={searchQuery}
            onChange={e => onSearchChange?.(e.target.value)}
            className="h-8 w-32 sm:w-40 px-2.5 text-xs rounded-lg border focus:outline-none focus:ring-2"
            style={{ borderColor: t.navBorder, background: t.cardBg, color: t.pageText }}
          />
          <button
            onClick={() => { setSearchOpen(false); onSearchChange?.(''); }}
            className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close search"
          >
            <X className="w-4 h-4" style={{ color: t.navText }} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setSearchOpen(true)}
          className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-opacity hover:opacity-80"
          aria-label="Search products"
          style={{ color: t.accent }}
        >
          <Search className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
