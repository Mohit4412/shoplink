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
}

// ─── Themes ──────────────────────────────────────────────────────────────────

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
  },

  slate: {
    tokens: {
      pageBg: '#1e293b',
      pageText: '#f1f5f9',
      navBg: 'rgba(15,23,42,0.9)',
      navBorder: '#334155',
      navText: '#f1f5f9',
      heroBg: 'transparent',
      heroHeading: '#f1f5f9',
      heroSub: '#cbd5e1',
      cardBg: '#334155',
      cardBorder: '#475569',
      cardShadow: '0 4px 12px rgba(0,0,0,0.3)',
      cardImageBg: '#475569',
      productName: '#f1f5f9',
      productMeta: '#cbd5e1',
      productPrice: '#f1f5f9',
      btnBg: '#f1f5f9',
      btnText: '#1e293b',
      btnHoverBg: '#cbd5e1',
      waBg: '#25D366',
      waText: '#FFFFFF',
      accent: '#60a5fa',
      accentLight: '#334155',
      sectionHeading: '#f1f5f9',
      footerBg: '#0f172a',
      footerBorder: '#334155',
      footerText: '#94a3b8',
    },
    layout: {
      heroStyle: 'fullbleed',
      productGrid: 'grid-3col',
      cardStyle: 'floating',
      navStyle: 'centered-logo',
      typographyScale: 'display',
      cardAnatomy: 'square-overlay',
      sectionSpacing: 'airy',
    },
  },

  rose: {
    tokens: {
      pageBg: '#fff1f2',
      pageText: '#881337',
      navBg: 'rgba(255,255,255,0.9)',
      navBorder: '#fecdd3',
      navText: '#881337',
      heroBg: 'transparent',
      heroHeading: '#881337',
      heroSub: '#9f1239',
      cardBg: '#FFFFFF',
      cardBorder: '#fecdd3',
      cardShadow: '0 2px 8px rgba(225,29,72,0.1)',
      cardImageBg: '#ffe4e6',
      productName: '#881337',
      productMeta: '#be123c',
      productPrice: '#881337',
      btnBg: '#e11d48',
      btnText: '#FFFFFF',
      btnHoverBg: '#be123c',
      waBg: '#25D366',
      waText: '#FFFFFF',
      accent: '#e11d48',
      accentLight: '#ffe4e6',
      sectionHeading: '#881337',
      footerBg: '#FFFFFF',
      footerBorder: '#fecdd3',
      footerText: '#be123c',
    },
    layout: {
      heroStyle: 'split',
      productGrid: 'grid-2col',
      cardStyle: 'boxed',
      navStyle: 'minimal',
      typographyScale: 'editorial',
      cardAnatomy: 'portrait',
      sectionSpacing: 'relaxed',
    },
  },

  forest: {
    tokens: {
      pageBg: '#f0fdf4',
      pageText: '#14532d',
      navBg: 'rgba(255,255,255,0.95)',
      navBorder: '#bbf7d0',
      navText: '#14532d',
      heroBg: 'transparent',
      heroHeading: '#14532d',
      heroSub: '#166534',
      cardBg: '#FFFFFF',
      cardBorder: '#bbf7d0',
      cardShadow: '0 1px 3px rgba(22,101,52,0.1)',
      cardImageBg: '#dcfce7',
      productName: '#14532d',
      productMeta: '#166534',
      productPrice: '#14532d',
      btnBg: '#16a34a',
      btnText: '#FFFFFF',
      btnHoverBg: '#15803d',
      waBg: '#25D366',
      waText: '#FFFFFF',
      accent: '#16a34a',
      accentLight: '#dcfce7',
      sectionHeading: '#14532d',
      footerBg: '#FFFFFF',
      footerBorder: '#bbf7d0',
      footerText: '#166534',
    },
    layout: {
      heroStyle: 'centered',
      productGrid: 'list',
      cardStyle: 'boxed',
      navStyle: 'inline-search',
      typographyScale: 'compact',
      cardAnatomy: 'editorial-row',
      sectionSpacing: 'tight',
    },
  },

  ocean: {
    tokens: {
      pageBg: '#f0f9ff',
      pageText: '#0c4a6e',
      navBg: 'rgba(255,255,255,0.9)',
      navBorder: '#bae6fd',
      navText: '#0c4a6e',
      heroBg: 'transparent',
      heroHeading: '#0c4a6e',
      heroSub: '#075985',
      cardBg: '#FFFFFF',
      cardBorder: '#bae6fd',
      cardShadow: '0 2px 8px rgba(7,89,133,0.1)',
      cardImageBg: '#e0f2fe',
      productName: '#0c4a6e',
      productMeta: '#075985',
      productPrice: '#0c4a6e',
      btnBg: '#0284c7',
      btnText: '#FFFFFF',
      btnHoverBg: '#0369a1',
      waBg: '#25D366',
      waText: '#FFFFFF',
      accent: '#0284c7',
      accentLight: '#e0f2fe',
      sectionHeading: '#0c4a6e',
      footerBg: '#FFFFFF',
      footerBorder: '#bae6fd',
      footerText: '#075985',
    },
    layout: {
      heroStyle: 'split',
      productGrid: 'grid-3col',
      cardStyle: 'boxed',
      navStyle: 'centered-logo',
      typographyScale: 'editorial',
      cardAnatomy: 'landscape',
      sectionSpacing: 'relaxed',
    },
  },

  amber: {
    tokens: {
      pageBg: '#fffbeb',
      pageText: '#78350f',
      navBg: 'rgba(255,255,255,0.9)',
      navBorder: '#fde68a',
      navText: '#78350f',
      heroBg: 'transparent',
      heroHeading: '#78350f',
      heroSub: '#92400e',
      cardBg: '#FFFFFF',
      cardBorder: '#fde68a',
      cardShadow: '0 1px 3px rgba(146,64,14,0.1)',
      cardImageBg: '#fef3c7',
      productName: '#78350f',
      productMeta: '#92400e',
      productPrice: '#78350f',
      btnBg: '#f59e0b',
      btnText: '#FFFFFF',
      btnHoverBg: '#d97706',
      waBg: '#25D366',
      waText: '#FFFFFF',
      accent: '#f59e0b',
      accentLight: '#fef3c7',
      sectionHeading: '#78350f',
      footerBg: '#FFFFFF',
      footerBorder: '#fde68a',
      footerText: '#92400e',
    },
    layout: {
      heroStyle: 'centered',
      productGrid: 'grid-2col',
      cardStyle: 'boxed',
      navStyle: 'minimal',
      typographyScale: 'compact',
      cardAnatomy: 'square-overlay',
      sectionSpacing: 'tight',
    },
  },

  vibe: {
    tokens: {
      pageBg: '#faf5ff',
      pageText: '#581c87',
      navBg: 'rgba(255,255,255,0.9)',
      navBorder: '#e9d5ff',
      navText: '#581c87',
      heroBg: 'transparent',
      heroHeading: '#581c87',
      heroSub: '#6b21a8',
      cardBg: '#FFFFFF',
      cardBorder: '#e9d5ff',
      cardShadow: '0 4px 12px rgba(107,33,168,0.15)',
      cardImageBg: '#f3e8ff',
      productName: '#581c87',
      productMeta: '#6b21a8',
      productPrice: '#581c87',
      btnBg: '#9333ea',
      btnText: '#FFFFFF',
      btnHoverBg: '#7e22ce',
      waBg: '#25D366',
      waText: '#FFFFFF',
      accent: '#9333ea',
      accentLight: '#f3e8ff',
      sectionHeading: '#581c87',
      footerBg: '#FFFFFF',
      footerBorder: '#e9d5ff',
      footerText: '#6b21a8',
    },
    layout: {
      heroStyle: 'split',
      productGrid: 'grid-3col',
      cardStyle: 'floating',
      navStyle: 'centered-logo',
      typographyScale: 'display',
      cardAnatomy: 'editorial-row',
      sectionSpacing: 'airy',
    },
  },

};

// ─── Public API ───────────────────────────────────────────────────────────────

export function getTheme(themeId?: string): Theme {
  return THEMES[themeId ?? 'classic'] ?? THEMES.classic;
}
