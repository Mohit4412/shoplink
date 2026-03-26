import { AppState, Product, StoreSettings, UserProfile } from '@/src/types';

export const normalizeProduct = (product: Product): Product => ({
  ...product,
  images: product.images?.length ? product.images : [product.imageUrl],
  highlights: product.highlights ?? [],
  reviews: product.reviews ?? [],
});

export function getDefaultAppState(): AppState {
  return {
    user: null,
    store: {
      logoUrl: '',
      name: '',
      tagline: '',
      bio: '',
      trustBadges: [],
      currency: 'INR',
    },
    products: [],
    orders: [],
    analytics: {
      totalViews: 0,
      totalClicks: 0,
      sourceSummary: [],
      referrerSummary: [],
      countrySummary: [],
      dailyStats: [],
    },
    notifications: [],
  };
}

export function getStarterMerchantBundle(user: UserProfile): { user: UserProfile; store: StoreSettings; products: Product[] } {
  return {
    user,
    store: {
      logoUrl: '',
      name: user.firstName ? `${user.firstName}'s Store` : user.username,
      tagline: 'Your WhatsApp storefront is ready to launch.',
      bio: '',
      trustBadges: [
        { text: 'Fast WhatsApp Support', icon: 'Truck' },
        { text: 'Secure Ordering', icon: 'ShieldCheck' },
        { text: 'Trusted Seller', icon: 'CheckCircle2' },
      ],
      currency: 'INR',
      theme: 'classic',
    },
    products: [],
  };
}
