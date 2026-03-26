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

};

// ─── Public API ───────────────────────────────────────────────────────────────

export function getTheme(themeId?: string): Theme {
  return THEMES[themeId ?? 'classic'] ?? THEMES.classic;
}
