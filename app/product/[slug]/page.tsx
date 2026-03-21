import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CheckCircle2, ShieldCheck, ArrowRight, Star } from 'lucide-react';
import { ProductCarousel } from '@/src/components/product/ProductCarousel';
import { FloatingWhatsApp } from '@/src/components/product/FloatingWhatsApp';
import { ProductAccordion } from '@/src/components/product/ProductAccordion';
import { ProductActions } from '@/src/components/product/ProductActions';

// Mock DB Fetch
async function getProductBySlug(slug: string) {
  // Simulate network request
  await new Promise((res) => setTimeout(res, 500));

  if (slug === 'not-found') return null;

  return {
    id: 'p-mock-1',
    slug: slug,
    name: 'Premium Everyday Hoodie',
    description: 
      'Experience ultimate comfort with our heavyweight loopback cotton hoodie. Cut for a relaxed fit, it features a double-lined hood, subtle dropped shoulders, and a minimal unbranded aesthetic. Perfect for throwing on post-workout or styling for relaxed weekend wear. Pre-shrunk and garment dyed for lasting color.',
    price: 85.0,
    compareAtPrice: 120.0,
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2787&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578587018452-892bace94f12?q=80&w=2787&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556821840-3a63aaabf986?q=80&w=2787&auto=format&fit=crop',
    ],
    variants: [
      { name: 'Size', options: ['S', 'M', 'L', 'XL'] },
      { name: 'Color', options: ['Washed Black', 'Heather Grey', 'Olive'] },
    ],
    stockQuantity: 4,
    tags: ['Apparel', 'Essentials'],
    category: 'Clothing',
    features: [
      '100% Organic Heavyweight Cotton (400gsm)',
      'Double-lined structured hood',
      'Pre-shrunk for an accurate fit',
      'Kangaroo pocket with hidden phone compartment',
    ],
    rating: 4.8,
    reviewsCount: 128,
  };
}

// Mock related products
const RELATED_PRODUCTS = [
  {
    id: 'rp-1',
    slug: 'essential-crewneck-tee',
    name: 'Essential Crewneck Tee',
    price: 35.0,
    category: 'Clothing',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2960&auto=format&fit=crop',
  },
  {
    id: 'rp-2',
    slug: 'minimalist-cap',
    name: 'Classic Minimalist Cap',
    price: 28.0,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=2836&auto=format&fit=crop',
  },
  {
    id: 'rp-3',
    slug: 'woven-joggers',
    name: 'Everyday Woven Joggers',
    price: 75.0,
    category: 'Clothing',
    imageUrl: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?q=80&w=2787&auto=format&fit=crop',
  },
  {
    id: 'rp-4',
    slug: 'leather-weekender',
    name: 'Leather Weekender Bag',
    price: 150.0,
    category: 'Bags',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=3000&auto=format&fit=crop',
  },
];

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return { title: 'Product Not Found | ShopLink.site' };
  }
  return {
    title: `${product.name} | ShopLink.site`,
    description: product.description.substring(0, 160),
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  // Define WhatsApp Number for this store/merchant
  const SELLER_WHATSAPP = '1234567890'; // Mock seller number

  const TRUST_BADGES = [
    { icon: <ShieldCheck className="w-5 h-5 text-teal-600" />, text: '7-Day Easy Returns' },
    { icon: <CheckCircle2 className="w-5 h-5 text-teal-600" />, text: 'Top Rated Seller' },
    { icon: <ArrowRight className="w-5 h-5 text-teal-600" />, text: 'Fast Free Shipping' },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans pb-32">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        
        {/* Breadcrumb (Optional, but good for UX) */}
        <nav className="mb-6 lg:mb-10 text-xs sm:text-sm text-gray-400 font-medium tracking-wide">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/category/${product.category.toLowerCase()}`} className="hover:text-gray-900 transition-colors">{product.category}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 xl:gap-20">
          
          {/* Left Column: Images */}
          <section className="flex-1 w-full lg:max-w-3xl lg:sticky lg:top-8 h-fit">
            <ProductCarousel images={product.images} productName={product.name} />
          </section>

          {/* Right Column: Details */}
          <section className="flex-1 w-full flex flex-col">
            
            {/* Reviews & Title */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
                <span className="text-xs text-gray-400 font-medium">({product.reviewsCount} reviews)</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold tracking-tight text-gray-900 leading-[1.1]">
                {product.name}
              </h1>
            </div>

            {/* Actions & Price */}
            <ProductActions 
              productName={product.name}
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              variants={product.variants}
              stockQuantity={product.stockQuantity}
              whatsAppNumber={SELLER_WHATSAPP}
            />

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10 py-6 border-y border-gray-200">
              {TRUST_BADGES.map((badge, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-shrink-0">{badge.icon}</div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-700">{badge.text}</span>
                </div>
              ))}
            </div>

            {/* Bullet Points */}
            <div className="mb-10">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">Key Features</h3>
              <ul className="space-y-3">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-600">
                    <span className="mr-3 text-teal-500 font-bold">•</span>
                    <span className="leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Accordion Details */}
            <ProductAccordion description={product.description} />
            
          </section>
        </div>

        {/* Related Products */}
        <div className="mt-24 lg:mt-32 pt-16 border-t border-gray-200">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mb-10 text-center">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {RELATED_PRODUCTS.map((prod) => (
              <div key={prod.id} className="group flex flex-col">
                <Link href={`/product/${prod.slug}`} className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gray-100 mb-4">
                  <Image 
                    src={prod.imageUrl} 
                    alt={prod.name} 
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                </Link>
                <div className="flex flex-col items-start gap-1 px-1">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{prod.category}</p>
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-1 w-full flex items-center justify-between">
                    <Link href={`/product/${prod.slug}`} className="hover:text-teal-600 transition-colors truncate pr-2">
                      {prod.name}
                    </Link>
                    <span className="text-sm font-extrabold flex-shrink-0">${prod.price.toFixed(2)}</span>
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Global Floating FAB */}
      <FloatingWhatsApp phoneNumber={SELLER_WHATSAPP} productName={product.name} />
    </div>
  );
}
