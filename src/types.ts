export type ProductStatus = 'Active' | 'Draft';


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
  highlights?: string[];
  reviews?: ProductReview[];
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
  status: 'pending' | 'confirmed' | 'declined';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  date: string;
}

export interface SectionConfig {
  id: 'hero' | 'featured' | 'all-products' | 'about' | 'whatsapp-cta';
  label: string;
  enabled: boolean;
  order: number;
  settings?: {
    ctaText?: string;        // hero: button label
    heading?: string;        // about / featured: custom heading
    subtext?: string;        // about: custom subtext
    ctaMessage?: string;     // whatsapp-cta: custom chat message
  };
}

export interface TrustBadgeConfig {
  text: string;
  icon: string;
}

export interface StoreSettings {
  logoUrl: string;
  name: string;
  tagline: string;
  bio?: string;
  trustBadges?: TrustBadgeConfig[];
  currency: string;
  theme?: string;
  sections?: SectionConfig[];
  banners?: string[];
  customDomain?: string;
  customDomainStatus?: 'pending' | 'active' | 'failed';
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
