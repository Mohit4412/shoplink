import { AppState, Product, PublicStorefrontData, StoreSettings, UserProfile } from '@/src/types';

export const normalizeProduct = (product: Product): Product => ({
  ...product,
  collections: Array.from(new Set(
    (product.collections?.length ? product.collections : product.collection ? [product.collection] : [])
      .map((collection) => collection.trim())
      .filter(Boolean)
  )),
  collection: Array.from(new Set(
    (product.collections?.length ? product.collections : product.collection ? [product.collection] : [])
      .map((collection) => collection.trim())
      .filter(Boolean)
  ))[0],
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

export function getDemoStorefront(): PublicStorefrontData {
  return {
    user: {
      username: 'demo',
      whatsappNumber: '+919876543210',
      plan: 'Pro',
    },
    store: {
      logoUrl: '',
      name: 'Aroha Edit',
      tagline: 'Everyday statement pieces for a clean, elevated wardrobe.',
      bio: 'Aroha Edit is a modern fashion label built for effortless dressing. Think polished co-ords, easy layers, elevated basics, and accessories that look sharp in your feed and even better in real life.',
      trustBadges: [
        { text: 'Ships in 48 Hours', icon: 'Truck' },
        { text: 'Premium Fabrics', icon: 'ShieldCheck' },
        { text: 'Style Help on WhatsApp', icon: 'MessageCircle' },
      ],
      currency: 'INR',
      theme: 'spark',
      banners: [
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop',
      ],
      legalPages: {
        shipping: 'Orders ship within 2 business days. Metro delivery usually takes 3-5 days, and non-metro delivery takes 5-7 days.',
        returns: 'Return requests are accepted within 7 days of delivery for unused pieces with tags intact.',
        privacy: 'We only use your details to fulfill orders and support you on WhatsApp.',
        terms: 'Color may vary slightly by screen. Size and fit details are listed on each product page.',
      },
    },
    products: [
      {
        id: 'demo-luna-coord-set',
        imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop',
        ],
        name: 'Luna Linen Co-ord Set',
        price: 2890,
        description: 'A breezy linen-blend co-ord with a relaxed shirt and straight-fit trousers for polished daytime looks.',
        status: 'Active',
        createdAt: '2026-03-01T10:00:00.000Z',
        category: 'Co-ords',
        stock: 14,
        collection: 'Best Sellers',
        highlights: ['Soft linen blend', 'Relaxed fit', 'Easy day-to-night set'],
        reviews: [
          { id: 'r1', author: 'Aarushi', rating: 5, quote: 'Looks so premium and fits beautifully.', location: 'Delhi' },
          { id: 'r2', author: 'Rhea', rating: 5, quote: 'Exactly the easy set I wanted for brunch and travel.', location: 'Mumbai' },
        ],
      },
      {
        id: 'demo-sienna-shirt',
        imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop',
        ],
        name: 'Sienna Oversized Shirt',
        price: 1590,
        description: 'A clean oversized shirt in a warm rust tone that works tucked, layered, or worn open over a fitted tank.',
        status: 'Active',
        createdAt: '2026-03-04T09:30:00.000Z',
        category: 'Shirts',
        stock: 22,
        collection: 'Wardrobe Staples',
        highlights: ['Lightweight cotton feel', 'Relaxed oversized cut', 'Easy layering piece'],
        reviews: [
          { id: 'r3', author: 'Neha', rating: 5, quote: 'The fit is perfect and the color photographs beautifully.', location: 'Pune' },
        ],
      },
      {
        id: 'demo-noir-sling',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
        ],
        name: 'Noir Mini Sling Bag',
        price: 1990,
        description: 'A structured mini sling with clean hardware and just enough room for your essentials.',
        status: 'Active',
        createdAt: '2026-03-06T12:15:00.000Z',
        category: 'Accessories',
        stock: 31,
        collection: 'Accessories',
        highlights: ['Structured shape', 'Adjustable strap', 'Day-to-night styling'],
        reviews: [
          { id: 'r4', author: 'Kriti', rating: 4, quote: 'Looks sharp, feels sturdy, and goes with everything.', location: 'Bangalore' },
        ],
      },
      {
        id: 'demo-ribbed-tank',
        imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop',
        ],
        name: 'Core Ribbed Tank',
        price: 790,
        description: 'A fitted ribbed tank that layers cleanly under shirts, jackets, and co-ords all year round.',
        status: 'Active',
        createdAt: '2026-03-08T15:45:00.000Z',
        category: 'Basics',
        stock: 18,
        collection: 'New Arrivals',
        highlights: ['Stretch rib knit', 'Close fit', 'Everyday staple'],
        reviews: [],
      },
      {
        id: 'demo-pleated-trouser',
        imageUrl: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?q=80&w=1200&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1475180098004-ca77a66827be?q=80&w=1200&auto=format&fit=crop',
        ],
        name: 'Tailored Pleated Trouser',
        price: 1890,
        description: 'A full-length pleated trouser with a polished silhouette for office looks, dinners, and elevated everyday outfits.',
        status: 'Active',
        createdAt: '2026-03-10T11:00:00.000Z',
        category: 'Bottoms',
        stock: 9,
        collection: 'Wardrobe Staples',
        highlights: ['Soft tailoring', 'Straight leg', 'Smart neutral shade'],
        reviews: [
          { id: 'r5', author: 'Ishita', rating: 5, quote: 'Falls so well and instantly makes an outfit look finished.', location: 'Hyderabad' },
        ],
      },
      {
        id: 'demo-layered-chain',
        imageUrl: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1200&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1200&auto=format&fit=crop',
        ],
        name: 'Layered Gold Chain Set',
        price: 990,
        description: 'A lightweight layered chain set that adds just enough shine to basics, dresses, and occasion looks.',
        status: 'Active',
        createdAt: '2026-03-12T08:20:00.000Z',
        category: 'Jewellery',
        stock: 6,
        collection: 'Accessories',
        highlights: ['Layered styling', 'Lightweight wear', 'Easy gifting pick'],
        reviews: [
          { id: 'r6', author: 'Sanya', rating: 5, quote: 'Makes the whole look feel more styled in seconds.', location: 'Jaipur' },
        ],
      },
      {
        id: 'demo-structured-blazer',
        imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop',
        ],
        name: 'Structured Day Blazer',
        price: 3290,
        description: 'A softly structured blazer designed to throw over dresses, tanks, and work separates without feeling stiff.',
        status: 'Active',
        createdAt: '2026-03-13T10:15:00.000Z',
        category: 'Outerwear',
        stock: 11,
        collection: 'Best Sellers',
        highlights: ['Light shoulder structure', 'Soft everyday tailoring', 'Easy layering essential'],
        reviews: [
          { id: 'r7', author: 'Mitali', rating: 5, quote: 'Smart enough for meetings and easy enough for weekends.', location: 'Ahmedabad' },
        ],
      },
      {
        id: 'demo-midi-slip-dress',
        imageUrl: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=1200&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=1200&auto=format&fit=crop',
        ],
        name: 'Muse Midi Slip Dress',
        price: 2490,
        description: 'A fluid midi slip dress that works with sneakers by day and layered jewellery by evening.',
        status: 'Active',
        createdAt: '2026-03-14T13:10:00.000Z',
        category: 'Dresses',
        stock: 13,
        collection: 'New Arrivals',
        highlights: ['Soft drape', 'Adjustable straps', 'Day-to-evening shape'],
        reviews: [
          { id: 'r8', author: 'Shruti', rating: 5, quote: 'The cut is so flattering and the fabric feels luxe.', location: 'Chennai' },
        ],
      },
      {
        id: 'demo-relaxed-denim',
        imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop',
        ],
        name: 'Relaxed Straight Denim',
        price: 1790,
        description: 'A clean straight-fit denim with an easy mid-rise waist and a washed finish that pairs with everything.',
        status: 'Active',
        createdAt: '2026-03-15T09:50:00.000Z',
        category: 'Bottoms',
        stock: 19,
        collection: 'Wardrobe Staples',
        highlights: ['Straight-leg fit', 'Mid-rise waist', 'Soft washed denim'],
        reviews: [
          { id: 'r9', author: 'Pallavi', rating: 4, quote: 'The fit is relaxed in the right places and super wearable.', location: 'Kolkata' },
        ],
      },
      {
        id: 'demo-everyday-hoops',
        imageUrl: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=1200&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=1200&auto=format&fit=crop',
        ],
        name: 'Everyday Mini Hoops',
        price: 690,
        description: 'A polished mini hoop set made for daily wear, layering, and gifting.',
        status: 'Active',
        createdAt: '2026-03-16T11:25:00.000Z',
        category: 'Jewellery',
        stock: 27,
        collection: 'Accessories',
        highlights: ['Lightweight finish', 'Easy daily styling', 'Minimal shine'],
        reviews: [
          { id: 'r10', author: 'Tanvi', rating: 5, quote: 'Exactly the kind of everyday hoops I keep reaching for.', location: 'Surat' },
        ],
      },
      {
        id: 'demo-soft-tote',
        imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop',
        ],
        name: 'Soft Carry Tote',
        price: 2190,
        description: 'A roomy tote bag with a clean silhouette for workdays, travel days, and everything in between.',
        status: 'Active',
        createdAt: '2026-03-17T16:10:00.000Z',
        category: 'Accessories',
        stock: 8,
        collection: 'Best Sellers',
        highlights: ['Roomy interior', 'Soft structured body', 'Work-to-weekend essential'],
        reviews: [
          { id: 'r11', author: 'Komal', rating: 5, quote: 'Carries everything without looking bulky.', location: 'Noida' },
        ],
      },
      {
        id: 'demo-cropped-knit',
        imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1200&auto=format&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1200&auto=format&fit=crop',
        ],
        name: 'Cloud Cropped Knit Top',
        price: 1290,
        description: 'A soft knit top with a clean cropped length that works with high-waist trousers, skirts, and denim.',
        status: 'Active',
        createdAt: '2026-03-18T12:00:00.000Z',
        category: 'Tops',
        stock: 16,
        collection: 'New Arrivals',
        highlights: ['Soft-touch knit', 'Clean cropped fit', 'Easy layering top'],
        reviews: [
          { id: 'r12', author: 'Ritika', rating: 4, quote: 'Soft, flattering, and easy to style.', location: 'Lucknow' },
        ],
      },
    ],
  };
}
