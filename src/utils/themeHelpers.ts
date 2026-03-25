import type { ThemeLayout } from './themes';

export interface TypographyClasses {
  heroHeading: string;
  sectionHeading: string;
  productName: string;
  productMeta: string;
  priceLabel: string;
}

export function getTypographyClasses(scale?: ThemeLayout['typographyScale']): TypographyClasses {
  switch (scale) {
    case 'compact':
      return {
        heroHeading:    'text-3xl font-extrabold tracking-tight leading-tight',
        sectionHeading: 'text-xl font-bold tracking-tight leading-snug',
        productName:    'text-sm font-semibold leading-snug',
        productMeta:    'text-xs leading-tight',
        priceLabel:     'text-sm font-bold',
      };
    case 'display':
      return {
        heroHeading:    'text-5xl font-black tracking-tight leading-[1.05]',
        sectionHeading: 'text-3xl font-extrabold tracking-tight leading-tight',
        productName:    'text-lg font-bold leading-snug',
        productMeta:    'text-sm leading-relaxed',
        priceLabel:     'text-xl font-extrabold',
      };
    case 'editorial':
    default:
      return {
        heroHeading:    'text-4xl font-extrabold tracking-tight leading-[1.1]',
        sectionHeading: 'text-2xl font-bold tracking-tight leading-snug',
        productName:    'text-base font-semibold leading-snug',
        productMeta:    'text-xs leading-relaxed',
        priceLabel:     'text-base font-bold',
      };
  }
}

export function getSectionSpacingClass(spacing?: ThemeLayout['sectionSpacing']): string {
  switch (spacing) {
    case 'tight':   return 'mb-12';
    case 'airy':    return 'mb-32';
    case 'relaxed':
    default:        return 'mb-20';
  }
}
