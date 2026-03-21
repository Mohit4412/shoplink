import { format, subDays } from 'date-fns';
import { AppState, Product, StoreSettings, UserProfile } from '@/src/types';

export const normalizeProduct = (product: Product): Product => ({
  ...product,
  images: product.images?.length ? product.images : [product.imageUrl],
  highlights: product.highlights ?? [],
  reviews: product.reviews ?? [],
});

export function getDefaultAppState(): AppState {
  const today = new Date();

  const initialProducts: Product[] = [
    {
      id: 'p1',
      name: 'Minimalist White Sneakers',
      price: 85.0,
      description: 'Clean, versatile, and crafted from premium vegan leather. The perfect everyday sneaker that pairs with almost anything in your wardrobe.',
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2224&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2224&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=2787&auto=format&fit=crop',
      ],
      status: 'Active',
      createdAt: subDays(today, 2).toISOString(),
      category: 'Footwear',
      stock: 45,
      collection: 'Summer Collection',
      highlights: ['Vegan Leather', 'Orthopedic insole', 'Lightweight'],
      reviews: [
        { id: 'r1', author: 'Mark', rating: 5, quote: 'Incredibly comfortable right out of the box!', location: 'New York' },
      ],
    },
    {
      id: 'p2',
      name: 'Textured Knit Sweater',
      price: 120.0,
      description: 'A cozy, heavy-gauge knit sweater made from a soft merino wool blend. Features a subtle waffle texture and a relaxed, drop-shoulder fit.',
      imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=2872&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=2872&auto=format&fit=crop',
      ],
      status: 'Active',
      createdAt: subDays(today, 5).toISOString(),
      category: 'Apparel',
      stock: 20,
      collection: 'Office Wear',
      highlights: ['Merino Wool Blend', 'Drop-shoulder', 'Heavy-gauge knit'],
      reviews: [],
    },
    {
      id: 'p3',
      name: 'Matte Black Chronograph',
      price: 195.0,
      description: 'Sleek, stealthy, and functional. This chronograph features a matte black stainless steel case, a minimalist dial, and a durable mesh band.',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2899&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2899&auto=format&fit=crop',
      ],
      status: 'Active',
      createdAt: subDays(today, 12).toISOString(),
      category: 'Accessories',
      stock: 8,
      collection: 'Summer Collection',
      highlights: ['Stainless Steel', 'Sapphire Crystal', 'Water Resistant 5ATM'],
      reviews: [
        { id: 'r2', author: 'Sam', rating: 5, quote: 'Looks so much more expensive than it is. Great everyday watch.', location: 'London' },
      ],
    },
    {
      id: 'p4',
      name: 'Classic Aviator Sunglasses',
      price: 65.0,
      description: 'Timeless aviator design with gold-tone frames and polarized dark green lenses. Lightweight and designed for all-day comfort.',
      imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=2960&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=2960&auto=format&fit=crop',
      ],
      status: 'Active',
      createdAt: subDays(today, 15).toISOString(),
      category: 'Accessories',
      stock: 30,
      highlights: ['Polarized Lenses', 'UV400 Protection', 'Lightweight Frame'],
      reviews: [],
    },
    {
      id: 'p5',
      name: 'Leather Weekend Duffel',
      price: 250.0,
      description: 'The ultimate travel companion. Handcrafted from top-grain leather, featuring a spacious main compartment and solid brass hardware.',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=3000&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=3000&auto=format&fit=crop',
      ],
      status: 'Active',
      createdAt: subDays(today, 20).toISOString(),
      category: 'Bags',
      stock: 5,
      collection: 'Office Wear',
      highlights: ['Top-grain Leather', 'Brass Hardware', 'Carry-on Approved'],
      reviews: [
        { id: 'r3', author: 'David', rating: 5, quote: 'Beautiful craftsmanship. Gets compliments at the airport.', location: 'Chicago' },
      ],
    },
    {
      id: 'p6',
      name: 'Essential White T-Shirt',
      price: 35.0,
      description: 'The perfect white tee does exist. Made from heavyweight pima cotton, pre-shrunk, and cut with a tailored but relaxed fit.',
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2960&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2960&auto=format&fit=crop',
      ],
      status: 'Active',
      createdAt: subDays(today, 25).toISOString(),
      category: 'Apparel',
      stock: 120,
      collection: 'Winter Special',
      highlights: ['Pima Cotton', 'Pre-shrunk', 'Heavyweight'],
      reviews: [
        { id: 'r4', author: 'Alex', rating: 4, quote: 'Very thick and structured. Runs slightly large.', location: 'Toronto' },
      ],
    },
  ];

  const initialOrders = [
    {
      id: 'o1',
      productId: 'p1',
      quantity: 2,
      revenue: 50.0,
      date: new Date(subDays(today, 0).setHours(14, 23, 0)).toISOString(),
      notes: 'Customer from Instagram',
      status: 'confirmed' as const,
    },
    {
      id: 'o2',
      productId: 'p2',
      quantity: 1,
      revenue: 18.0,
      date: new Date(subDays(today, 1).setHours(10, 15, 0)).toISOString(),
      notes: 'Repeat customer',
      status: 'confirmed' as const,
    },
    {
      id: 'o3',
      productId: 'p4',
      quantity: 3,
      revenue: 135.0,
      date: new Date(subDays(today, 2).setHours(9, 45, 0)).toISOString(),
      notes: 'Bulk order',
      status: 'confirmed' as const,
    },
    {
      id: 'o4',
      productId: 'p1',
      quantity: 1,
      revenue: 25.0,
      date: new Date(subDays(today, 3).setHours(16, 30, 0)).toISOString(),
      notes: '',
      status: 'confirmed' as const,
    },
    {
      id: 'o5',
      productId: 'p2',
      quantity: 2,
      revenue: 36.0,
      date: new Date(subDays(today, 4).setHours(11, 20, 0)).toISOString(),
      notes: '',
      status: 'confirmed' as const,
    },
    {
      id: 'o6',
      productId: 'p4',
      quantity: 1,
      revenue: 45.0,
      date: new Date(subDays(today, 5).setHours(13, 10, 0)).toISOString(),
      notes: '',
      status: 'confirmed' as const,
    },
    {
      id: 'o7',
      productId: 'p1',
      quantity: 1,
      revenue: 25.0,
      date: new Date(subDays(today, 6).setHours(18, 5, 0)).toISOString(),
      notes: '',
      status: 'confirmed' as const,
    },
    {
      id: 'o8',
      productId: 'p2',
      quantity: 1,
      revenue: 18.0,
      date: new Date(subDays(today, 7).setHours(8, 50, 0)).toISOString(),
      notes: '',
      status: 'confirmed' as const,
    },
  ];

  const initialDailyStats = Array.from({ length: 30 }).map((_, index) => {
    const date = subDays(today, 29 - index);
    return {
      date: format(date, 'MMM dd'),
      fullDate: format(date, 'yyyy-MM-dd'),
      views: Math.floor(Math.random() * 5000) + 1500,
      clicks: Math.floor(Math.random() * 800) + 200,
      orders: Math.floor(Math.random() * 20) + 5,
    };
  });

  initialDailyStats[29].clicks = 452;
  initialDailyStats[29].orders = 12;
  initialDailyStats[29].views = 3842;

  const totalViewsFromStats = initialDailyStats.reduce((sum, stat) => sum + stat.views, 0);
  const totalClicksFromStats = initialDailyStats.reduce((sum, stat) => sum + stat.clicks, 0);

  return {
    user: {
      id: 'u1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      bio: 'Tell us a bit about yourself',
      whatsappNumber: '+1234567800',
      avatarUrl: 'https://picsum.photos/seed/avatar/100/100',
      plan: 'Pro',
      subscriptionRenewalDate: 'April 12, 2026',
    },
    store: {
      logoUrl: 'https://picsum.photos/seed/logo/100/100',
      name: 'Essential Objects',
      tagline: 'Thoughtfully designed everyday carry items for the modern professional.',
      bio: '',
      trustBadges: [
        { text: '7-Day Easy Returns', icon: 'ShieldCheck' },
        { text: 'Top Rated Seller', icon: 'CheckCircle2' },
        { text: 'Fast Free Shipping', icon: 'Truck' },
      ],
      currency: 'USD',
    },
    products: initialProducts.map(normalizeProduct),
    orders: initialOrders,
    analytics: {
      totalViews: 693751 + totalViewsFromStats,
      totalClicks: 12450 + totalClicksFromStats,
      sourceSummary: [
        { source: 'instagram', views: 42, clicks: 6 },
        { source: 'direct', views: 31, clicks: 4 },
        { source: 'whatsapp', views: 18, clicks: 3 },
      ],
      referrerSummary: [
        { referrer: 'instagram.com', views: 42, clicks: 6 },
        { referrer: 'direct', views: 31, clicks: 4 },
        { referrer: 'wa.me', views: 18, clicks: 3 },
      ],
      countrySummary: [
        { country: 'US', views: 38, clicks: 5 },
        { country: 'IN', views: 29, clicks: 4 },
        { country: 'GB', views: 12, clicks: 2 },
      ],
      dailyStats: initialDailyStats,
    },
    notifications: [
      { id: '1', title: 'Low Stock Alert', message: 'Some products are running low on inventory.', read: false, date: subDays(today, 1).toISOString() },
      { id: '2', title: 'New Feature', message: 'Motion Dynamic theme is now available!', read: false, date: subDays(today, 0).toISOString() },
    ],
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
      currency: 'USD',
      theme: 'classic',
    },
    products: [],
  };
}
