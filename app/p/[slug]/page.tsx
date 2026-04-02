import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getPublicProductByStore } from '@/server/store-repository';
import { getCurrencySymbol } from '@/src/utils/currency';
import { ProductOrderSection } from '@/app/p/[slug]/ProductOrderSection';

type Props = { params: Promise<{ slug: string }> };

export const dynamic = 'force-dynamic';

function parseSlug(slug: string): { username: string; productId: string } | null {
  const idx = slug.indexOf('--');
  if (idx === -1) return null;
  const username = slug.slice(0, idx);
  const productId = slug.slice(idx + 2);
  return username && productId ? { username, productId } : null;
}

async function fetchProduct(slug: string) {
  const parsed = parseSlug(slug);
  if (!parsed) return null;
  return getPublicProductByStore(parsed.username, parsed.productId);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchProduct(slug);
  if (!result) return { title: 'Product not found' };
  return {
    title: `${result.product.name} | ${result.store.name}`,
    description: result.product.description || `Order ${result.product.name} from ${result.store.name}`,
    openGraph: {
      images: result.product.imageUrl ? [result.product.imageUrl] : [],
    },
  };
}

export default async function ProductSlugPage({ params }: Props) {
  const { slug } = await params;
  const result = await fetchProduct(slug);

  if (!result) notFound();

  const currencySymbol = getCurrencySymbol(result.store.currency);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="mx-auto max-w-2xl px-4 py-8">

        {/* Product card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
          {/* Image */}
          {result.product.imageUrl && (
            <div className="aspect-square w-full overflow-hidden bg-gray-100 sm:aspect-[16/9]">
              <img
                src={result.product.imageUrl}
                alt={result.product.name}
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
          )}

          {/* Info */}
          <div className="px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
              {result.store.name}
            </p>
            <h1 className="text-xl font-bold text-gray-900 leading-snug">
              {result.product.name}
            </h1>
            {result.product.description && (
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                {result.product.description}
              </p>
            )}
            <p className="mt-3 text-2xl font-black text-emerald-700">
              {currencySymbol}{result.product.price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Order form */}
        <div className="mt-6 rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">Place your order</h2>
          <Suspense fallback={<div className="py-8 text-center text-sm text-gray-400">Loading form…</div>}>
            <ProductOrderSection
              product={result.product}
              storeName={result.store.name}
              currencySymbol={currencySymbol}
              username={result.user.username}
              whatsappNumber={result.user.whatsappNumber}
              paymentSettings={result.store.paymentSettings}
            />
          </Suspense>
        </div>

      </div>
    </div>
  );
}
