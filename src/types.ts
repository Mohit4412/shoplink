export type ProductStatus = 'Active' | 'Draft';
export type PaymentProvider = 'manual' | 'stripe';
export type OrderPaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'declined'
  | 'payment_pending_verification'
  | 'checkout_pending'
  | 'paid'
  | 'payment_failed';


export interface ProductVariant {
  name: string;    // e.g. "Size", "Color"
  options: string[]; // e.g. ["S", "M", "L"] or ["Red", "Blue"]
}

export interface ProductPageSections {
  detailsTitle?: string;
  shippingTitle?: string;
  shippingContent?: string;
  careTitle?: string;
  careContent?: string;
}

export interface Product {
  id: string;
  imageUrl: string;
  images?: string[];
  name: string;
  price: number;
  description: string;
  status: ProductStatus;
  createdAt: string;
  category: string;
  stock: number;
  collection?: string;
  collections?: string[];
  highlights?: string[];
  variants?: ProductVariant[];
  reviews?: ProductReview[];
  pageSections?: ProductPageSections;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  quote: string;
  location?: string;
}



export interface Order {
  id: string;
  productId: string;
  quantity: number;
  revenue: number;
  date: string;
  notes?: string;
  status: OrderStatus;
  paymentProvider?: PaymentProvider;
  paymentStatus?: OrderPaymentStatus;
  paymentReference?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  date: string;
}


export interface TrustBadgeConfig {
  text: string;
  icon: string;
}

export type StoreSectionId = 'hero' | 'featured' | 'all-products' | 'about' | 'whatsapp-cta';

export interface SectionConfig {
  id: StoreSectionId;
  label: string;
  enabled: boolean;
  order: number;
  settings?: {
    heading?: string;
    subtext?: string;
    ctaText?: string;
  };
}

export interface StoreSettings {
  logoUrl: string;
  name: string;
  tagline: string;
  bio?: string;
  sections?: SectionConfig[];
  trustBadges?: TrustBadgeConfig[];
  currency: string;
  theme?: string;
  banners?: string[];
  customDomain?: string;
  customDomainStatus?: 'pending' | 'active' | 'failed';
  legalPages?: LegalPages;
  paymentSettings?: PaymentSettings;
}

export interface LegalPages {
  shipping?: string;
  returns?: string;
  privacy?: string;
  terms?: string;
}

export interface PaymentSettings {
  upiId?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankBranch?: string;
  checkoutProvider?: PaymentProvider;
  enableOnlineCheckout?: boolean;
  stripe?: StripePaymentAccount;
}

export interface StripePaymentAccount {
  accountId: string;
  accountEmail?: string;
  accountDisplayName?: string;
  onboardingComplete: boolean;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  lastSyncedAt?: string;
}

export type Store = StoreSettings;

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username: string;
  bio: string;
  whatsappNumber: string;
  avatarUrl: string;
  plan: 'Free' | 'Pro';
  subscriptionRenewalDate: string;
  razorpaySubscriptionId?: string;
}

export interface Analytics {
  totalViews: number;
  totalClicks: number;
  sourceSummary: {
    source: string;
    views: number;
    clicks: number;
  }[];
  referrerSummary: {
    referrer: string;
    views: number;
    clicks: number;
  }[];
  countrySummary: {
    country: string;
    views: number;
    clicks: number;
  }[];
  dailyStats: {
    date: string;
    fullDate: string;
    views: number;
    clicks: number;
    orders: number;
  }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AppState {
  user: UserProfile | null;
  store: StoreSettings;
  products: Product[];
  orders: Order[];
  analytics: Analytics;
  notifications: AppNotification[];
}

export interface PublicStorefrontUser {
  username: string;
  whatsappNumber: string;
  plan: UserProfile['plan'];
}

export interface PublicStorefrontData {
  user: PublicStorefrontUser;
  store: StoreSettings;
  products: Product[];
}
