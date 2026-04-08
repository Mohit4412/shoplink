import type { SectionConfig } from '../types';

export interface ThemeTokens {
  // Page
  pageBg: string;
  pageText: string;
  // Nav
  navBg: string;
  navBorder: string;
  navText: string;
  // Hero
  heroBg: string;
  heroHeading: string;
  heroSub: string;
  // Cards
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  cardImageBg: string;
  // Product name / text
  productName: string;
  productMeta: string;
  productPrice: string;
  // CTA button
  btnBg: string;
  btnText: string;
  btnHoverBg: string;
  // WhatsApp / action button
  waBg: string;
  waText: string;
  // Accent (links, hover, highlights)
  accent: string;
  accentLight: string;
  // Section headings
  sectionHeading: string;
  // Footer
  footerBg: string;
  footerBorder: string;
  footerText: string;
}

export interface ThemeLayout {
  heroStyle: 'centered' | 'split' | 'fullbleed';
  productGrid: 'grid-2col' | 'grid-3col' | 'list';
  cardStyle: 'boxed' | 'borderless' | 'floating';
  navStyle: 'minimal' | 'centered-logo' | 'inline-search';
  typographyScale: 'compact' | 'editorial' | 'display';
  cardAnatomy: 'portrait' | 'landscape' | 'square-overlay' | 'editorial-row';
  sectionSpacing: 'tight' | 'relaxed' | 'airy';
  /** Optional variant — enables theme-specific structural overrides in StoreFront */
  variant?: 'spark' | 'craft' | 'fresh' | 'swift' | 'noir';
}

export interface Theme {
  tokens: ThemeTokens;
  layout: ThemeLayout;
  defaultSections: SectionConfig[];
}

// ─── Themes ──────────────────────────────────────────────────────────────────

const DEFAULT_SECTIONS: SectionConfig[] = [
  {
    id: 'hero',
    label: 'Hero',
    enabled: true,
    order: 1,
    settings: {
      ctaText: 'Shop now',
    },
  },
  {
    id: 'featured',
    label: 'Featured Products',
    enabled: true,
    order: 2,
    settings: {
      heading: 'Featured Highlights',
    },
  },
  {
    id: 'all-products',
    label: 'All Products',
    enabled: true,
    order: 3,
    settings: {
      heading: 'All Products',
    },
  },
  {
    id: 'about',
    label: 'About',
    enabled: true,
    order: 4,
    settings: {
      heading: 'About Us',
    },
  },
  {
    id: 'whatsapp-cta',
    label: 'WhatsApp CTA',
    enabled: true,
    order: 5,
    settings: {
      heading: "Questions? We're on WhatsApp",
      subtext: 'Chat with us directly for quick help.',
      ctaText: 'Chat to Order',
    },
  },
];

const THEMES: Record<string, Theme> = {

  classic: {
    tokens: {
      pageBg: '#FAFAFA',
      pageText: '#111111',
      navBg: 'rgba(255,255,255,0.85)',
      navBorder: '#f0f0f0',
      navText: '#111111',
      heroBg: 'transparent',
      heroHeading: '#111111',
      heroSub: '#6b7280',
      cardBg: '#FFFFFF',
      cardBorder: '#e5e7eb',
      cardShadow: '0 1px 4px rgba(0,0,0,0.06)',
      cardImageBg: '#f3f4f6',
      productName: '#111111',
      productMeta: '#6b7280',
      productPrice: '#111111',
      btnBg: '#111111',
      btnText: '#FFFFFF',
      btnHoverBg: '#374151',
      waBg: '#25D366',
      waText: '#FFFFFF',
      accent: '#111111',
      accentLight: '#f3f4f6',
      sectionHeading: '#111111',
      footerBg: '#FFFFFF',
      footerBorder: '#e5e7eb',
      footerText: '#6b7280',
    },
    layout: {
      heroStyle: 'centered',
      productGrid: 'grid-2col',
      cardStyle: 'boxed',
      navStyle: 'minimal',
      typographyScale: 'editorial',
      cardAnatomy: 'portrait',
      sectionSpacing: 'relaxed',
    },
    defaultSections: DEFAULT_SECTIONS,
  },

  // ⚡ Spark — Instagram-grid feel, category tabs, fashion/clothing
  spark: {
    tokens: {
      pageBg: '#FFFFFF',
      pageText: '#0f0f0f',
      navBg: 'rgba(255,255,255,0.95)',
      navBorder: '#f0f0f0',
      navText: '#0f0f0f',
      heroBg: 'transparent',
      heroHeading: '#0f0f0f',
      heroSub: '#6b7280',
      cardBg: '#FFFFFF',
      cardBorder: 'transparent',
      cardShadow: 'none',
      cardImageBg: '#f5f5f5',
      productName: '#0f0f0f',
      productMeta: '#9ca3af',
      productPrice: '#0f0f0f',
      btnBg: '#0f0f0f',
      btnText: '#FFFFFF',
      btnHoverBg: '#374151',
      waBg: '#25D366',
      waText: '#FFFFFF',
      accent: '#0f0f0f',
      accentLight: '#f5f5f5',
      sectionHeading: '#0f0f0f',
      footerBg: '#FFFFFF',
      footerBorder: '#f0f0f0',
      footerText: '#9ca3af',
    },
    layout: {
      heroStyle: 'centered',
      productGrid: 'grid-2col',
      cardStyle: 'borderless',
      navStyle: 'minimal',
      typographyScale: 'compact',
      cardAnatomy: 'square-overlay',
      sectionSpacing: 'tight',
      variant: 'spark',
    },
    defaultSections: DEFAULT_SECTIONS,
  },

  // 🪡 Craft — Handmade/artisan, editorial storytelling, one product at a time
  craft: {
    tokens: {
      pageBg: '#FDFCFB',
      pageText: '#2d2d2d',
      navBg: 'rgba(253,252,251,0.95)',
      navBorder: '#e8e3dc',
      navText: '#2d2d2d',
      heroBg: 'transparent',
      heroHeading: '#2d2d2d',
      heroSub: '#6b6b6b',
      cardBg: '#FFFFFF',
      cardBorder: '#e8e3dc',
      cardShadow: '0 2px 8px rgba(0,0,0,0.04)',
      cardImageBg: '#f9f7f4',
      productName: '#2d2d2d',
      productMeta: '#8a8a8a',
      productPrice: '#2d2d2d',
      btnBg: '#2d2d2d',
      btnText: '#FDFCFB',
      btnHoverBg: '#4a4a4a',
      waBg: '#25D366',
      waText: '#FFFFFF',
      accent: '#c9a961',
      accentLight: '#f9f7f4',
      sectionHeading: '#2d2d2d',
      footerBg: '#FDFCFB',
      footerBorder: '#e8e3dc',
      footerText: '#8a8a8a',
    },
    layout: {
      heroStyle: 'fullbleed',
      productGrid: 'list',
      cardStyle: 'borderless',
      navStyle: 'minimal',
      typographyScale: 'editorial',
      cardAnatomy: 'editorial-row',
      sectionSpacing: 'airy',
      variant: 'craft',
    },
    defaultSections: DEFAULT_SECTIONS,
  },

  // 🌿 Fresh — Food/home business, clean catalogue, quantity selectors
  fresh: {
    tokens: {
      pageBg: '#F8FAF6',
      pageText: '#1a1a1a',
      navBg: 'rgba(248,250,246,0.95)',
      navBorder: '#e1e8dc',
      navText: '#1a1a1a',
      heroBg: '#EBF3E8',
      heroHeading: '#1a1a1a',
      heroSub: '#5a6c50',
      cardBg: '#FFFFFF',
      cardBorder: '#e1e8dc',
      cardShadow: '0 1px 3px rgba(0,0,0,0.05)',
      cardImageBg: '#f0f4ed',
      productName: '#1a1a1a',
      productMeta: '#7a8a6e',
      productPrice: '#2d5016',
      btnBg: '#4a7c2c',
      btnText: '#FFFFFF',
      btnHoverBg: '#3d6824',
      waBg: '#25D366',
      waText: '#FFFFFF',
      accent: '#4a7c2c',
      accentLight: '#EBF3E8',
      sectionHeading: '#1a1a1a',
      footerBg: '#F8FAF6',
      footerBorder: '#e1e8dc',
      footerText: '#7a8a6e',
    },
    layout: {
      heroStyle: 'centered',
      productGrid: 'list',
      cardStyle: 'boxed',
      navStyle: 'minimal',
      typographyScale: 'compact',
      cardAnatomy: 'landscape',
      sectionSpacing: 'tight',
      variant: 'fresh',
    },
    defaultSections: DEFAULT_SECTIONS,
  },

  // ⚡ Swift — Electronics/accessories, compact list, price-first
  swift: {
    tokens: {
      pageBg: '#FAFAFA',
      pageText: '#1a1a1a',
      navBg: 'rgba(255,255,255,0.95)',
      navBorder: '#e5e7eb',
      navText: '#1a1a1a',
      heroBg: 'transparent',
      heroHeading: '#1a1a1a',
      heroSub: '#6b7280',
      cardBg: '#FFFFFF',
      cardBorder: '#e5e7eb',
      cardShadow: '0 1px 2px rgba(0,0,0,0.05)',
      cardImageBg: '#f3f4f6',
      productName: '#1a1a1a',
      productMeta: '#9ca3af',
      productPrice: '#1a1a1a',
      btnBg: '#1a1a1a',
      btnText: '#FFFFFF',
      btnHoverBg: '#374151',
      waBg: '#25D366',
      waText: '#FFFFFF',
      accent: '#3b82f6',
      accentLight: '#eff6ff',
      sectionHeading: '#1a1a1a',
      footerBg: '#FFFFFF',
      footerBorder: '#e5e7eb',
      footerText: '#9ca3af',
    },
    layout: {
      heroStyle: 'centered',
      productGrid: 'list',
      cardStyle: 'boxed',
      navStyle: 'minimal',
      typographyScale: 'compact',
      cardAnatomy: 'landscape',
      sectionSpacing: 'tight',
      variant: 'swift',
    },
    defaultSections: DEFAULT_SECTIONS,
  },

  // ◆ Noir — Premium/luxury, dark editorial, minimal product count
  noir: {
    tokens: {
      pageBg: '#0a0a0a',
      pageText: '#e5e5e5',
      navBg: 'rgba(10,10,10,0.95)',
      navBorder: '#1f1f1f',
      navText: '#e5e5e5',
      heroBg: '#111111',
      heroHeading: '#ffffff',
      heroSub: '#a3a3a3',
      cardBg: '#111111',
      cardBorder: '#1f1f1f',
      cardShadow: '0 4px 12px rgba(0,0,0,0.3)',
      cardImageBg: '#1a1a1a',
      productName: '#ffffff',
      productMeta: '#737373',
      productPrice: '#d4af37',
      btnBg: '#ffffff',
      btnText: '#0a0a0a',
      btnHoverBg: '#e5e5e5',
      waBg: '#25D366',
      waText: '#FFFFFF',
      accent: '#d4af37',
      accentLight: '#1a1a1a',
      sectionHeading: '#ffffff',
      footerBg: '#0a0a0a',
      footerBorder: '#1f1f1f',
      footerText: '#737373',
    },
    layout: {
      heroStyle: 'fullbleed',
      productGrid: 'list',
      cardStyle: 'floating',
      navStyle: 'centered-logo',
      typographyScale: 'display',
      cardAnatomy: 'portrait',
      sectionSpacing: 'airy',
      variant: 'noir',
    },
    defaultSections: DEFAULT_SECTIONS,
  },

};

// ─── Public API ───────────────────────────────────────────────────────────────

export function getTheme(themeId?: string): Theme {
  return THEMES[themeId ?? 'classic'] ?? THEMES.classic;
}
