import { SectionConfig } from '../types';

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
}

export interface Theme {
  tokens: ThemeTokens;
  layout: ThemeLayout;
  defaultSections: SectionConfig[];
}

// ─── Shared default sections ────────────────────────────────────────────────

const STANDARD_SECTIONS: SectionConfig[] = [
  { id: 'hero',         label: 'Hero Banner',       enabled: true,  order: 1 },
  { id: 'featured',     label: 'Featured Products', enabled: true,  order: 2 },
  { id: 'all-products', label: 'All Products',      enabled: true,  order: 3 },
  { id: 'about',        label: 'About the Store',   enabled: false, order: 4 },
  { id: 'whatsapp-cta', label: 'WhatsApp CTA',      enabled: true,  order: 5 },
];

const MINIMAL_SECTIONS: SectionConfig[] = [
  { id: 'hero',         label: 'Hero Banner',       enabled: false, order: 1 },
  { id: 'featured',     label: 'Featured Products', enabled: false, order: 2 },
  { id: 'all-products', label: 'All Products',      enabled: true,  order: 3 },
  { id: 'about',        label: 'About the Store',   enabled: false, order: 4 },
  { id: 'whatsapp-cta', label: 'WhatsApp CTA',      enabled: true,  order: 5 },
];

const FULL_SECTIONS: SectionConfig[] = [
  { id: 'hero',         label: 'Hero Banner',       enabled: true,  order: 1 },
  { id: 'featured',     label: 'Featured Products', enabled: true,  order: 2 },
  { id: 'all-products', label: 'All Products',      enabled: true,  order: 3 },
  { id: 'about',        label: 'About the Store',   enabled: true,  order: 4 },
  { id: 'whatsapp-cta', label: 'WhatsApp CTA',      enabled: true,  order: 5 },
];

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
    },
    defaultSections: STANDARD_SECTIONS,
  },

  slate: {
    tokens: {
      pageBg: '#0f1117',
      pageText: '#e2e8f0',
      navBg: 'rgba(15,17,23,0.9)',
      navBorder: '#1e2230',
      navText: '#e2e8f0',
      heroBg: 'transparent',
      heroHeading: '#f1f5f9',
      heroSub: '#94a3b8',
      cardBg: '#1a1d27',
      cardBorder: '#2a2d3e',
      cardShadow: '0 2px 12px rgba(0,0,0,0.4)',
      cardImageBg: '#12141c',
      productName: '#f1f5f9',
      productMeta: '#64748b',
      productPrice: '#818cf8',
      btnBg: '#6366f1',
      btnText: '#FFFFFF',
      btnHoverBg: '#4f46e5',
      waBg: '#25D366',
      waText: '#FFFFFF',
      accent: '#6366f1',
      accentLight: '#1e1f35',
      sectionHeading: '#f1f5f9',
      footerBg: '#0d0f14',
      footerBorder: '#1e2230',
      footerText: '#64748b',
    },
    layout: {
      heroStyle: 'fullbleed',
      productGrid: 'grid-3col',
      cardStyle: 'floating',
    },
    defaultSections: FULL_SECTIONS,
  },

  rose: {
    tokens: {
      pageBg: '#fff5f7',
      pageText: '#4b2d33',
      navBg: 'rgba(255,245,247,0.9)',
      navBorder: '#fce7ea',
      navText: '#4b2d33',
      heroBg: 'transparent',
      heroHeading: '#3b1a20',
      heroSub: '#9d6270',
      cardBg: '#FFFFFF',
      cardBorder: '#fce7ea',
      cardShadow: '0 1px 6px rgba(225,29,72,0.07)',
      cardImageBg: '#fff0f2',
      productName: '#3b1a20',
      productMeta: '#9d6270',
      productPrice: '#e11d48',
      btnBg: '#e11d48',
      btnText: '#FFFFFF',
      btnHoverBg: '#be123c',
      waBg: '#25D366',
      waText: '#FFFFFF',
      accent: '#e11d48',
      accentLight: '#fff0f2',
      sectionHeading: '#3b1a20',
      footerBg: '#FFFFFF',
      footerBorder: '#fce7ea',
      footerText: '#9d6270',
    },
    layout: {
      heroStyle: 'split',
      productGrid: 'grid-2col',
      cardStyle: 'borderless',
    },
    defaultSections: STANDARD_SECTIONS,
  },

  forest: {
    tokens: {
      pageBg: '#f0fdf4',
      pageText: '#15573a',
      navBg: 'rgba(240,253,244,0.9)',
      navBorder: '#bbf7d0',
      navText: '#15573a',
      heroBg: 'transparent',
      heroHeading: '#14532d',
      heroSub: '#4ade80',
      cardBg: '#FFFFFF',
      cardBorder: '#bbf7d0',
      cardShadow: '0 1px 6px rgba(22,163,74,0.08)',
      cardImageBg: '#f0fdf4',
      productName: '#14532d',
      productMeta: '#4d7c5f',
      productPrice: '#16a34a',
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
      footerText: '#4d7c5f',
    },
    layout: {
      heroStyle: 'centered',
      productGrid: 'grid-3col',
      cardStyle: 'boxed',
    },
    defaultSections: FULL_SECTIONS,
  },

  ocean: {
    tokens: {
      pageBg: '#f0f9ff',
      pageText: '#155e75',
      navBg: 'rgba(240,249,255,0.9)',
      navBorder: '#bae6fd',
      navText: '#155e75',
      heroBg: 'transparent',
      heroHeading: '#0c4a6e',
      heroSub: '#38bdf8',
      cardBg: '#FFFFFF',
      cardBorder: '#bae6fd',
      cardShadow: '0 1px 6px rgba(8,145,178,0.08)',
      cardImageBg: '#e0f2fe',
      productName: '#0c4a6e',
      productMeta: '#2d7fa0',
      productPrice: '#0891b2',
      btnBg: '#0891b2',
      btnText: '#FFFFFF',
      btnHoverBg: '#0e7490',
      waBg: '#25D366',
      waText: '#FFFFFF',
      accent: '#0891b2',
      accentLight: '#e0f2fe',
      sectionHeading: '#0c4a6e',
      footerBg: '#FFFFFF',
      footerBorder: '#bae6fd',
      footerText: '#2d7fa0',
    },
    layout: {
      heroStyle: 'split',
      productGrid: 'grid-3col',
      cardStyle: 'floating',
    },
    defaultSections: STANDARD_SECTIONS,
  },

  amber: {
    tokens: {
      pageBg: '#fffbeb',
      pageText: '#78350f',
      navBg: 'rgba(255,251,235,0.9)',
      navBorder: '#fde68a',
      navText: '#78350f',
      heroBg: 'transparent',
      heroHeading: '#451a03',
      heroSub: '#b45309',
      cardBg: '#FFFFFF',
      cardBorder: '#fde68a',
      cardShadow: '0 1px 6px rgba(217,119,6,0.08)',
      cardImageBg: '#fef3c7',
      productName: '#451a03',
      productMeta: '#92400e',
      productPrice: '#d97706',
      btnBg: '#d97706',
      btnText: '#FFFFFF',
      btnHoverBg: '#b45309',
      waBg: '#25D366',
      waText: '#FFFFFF',
      accent: '#d97706',
      accentLight: '#fef3c7',
      sectionHeading: '#451a03',
      footerBg: '#FFFFFF',
      footerBorder: '#fde68a',
      footerText: '#92400e',
    },
    layout: {
      heroStyle: 'centered',
      productGrid: 'grid-2col',
      cardStyle: 'borderless',
    },
    defaultSections: MINIMAL_SECTIONS,
  },

  vibe: {
    tokens: {
      pageBg: '#FCFBF8', // off-white
      pageText: '#181C1A',
      navBg: 'rgba(252,251,248,0.85)',
      navBorder: '#E6E1D6',
      navText: '#181C1A',
      heroBg: 'transparent',
      heroHeading: '#0A7C6B', // deep teal
      heroSub: '#847F73',
      cardBg: '#FFFFFF',
      cardBorder: '#F5E8C7', // subtle gold
      cardShadow: '0 4px 20px rgba(10,124,107,0.06)',
      cardImageBg: '#F5F5F5',
      productName: '#181C1A',
      productMeta: '#847F73',
      productPrice: '#0A7C6B',
      btnBg: '#0A7C6B',
      btnText: '#FFFFFF',
      btnHoverBg: '#086355',
      waBg: '#0A7C6B', 
      waText: '#F5E8C7',
      accent: '#0A7C6B',
      accentLight: '#F5E8C7',
      sectionHeading: '#181C1A',
      footerBg: '#FFFFFF',
      footerBorder: '#E6E1D6',
      footerText: '#847F73',
    },
    layout: {
      heroStyle: 'split',
      productGrid: 'grid-3col',
      cardStyle: 'floating',
    },
    defaultSections: FULL_SECTIONS,
  },

};

// ─── Public API ───────────────────────────────────────────────────────────────

export function getTheme(themeId?: string): Theme {
  return THEMES[themeId ?? 'classic'] ?? THEMES.classic;
}
