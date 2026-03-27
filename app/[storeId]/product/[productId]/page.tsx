import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicProductByStore } from '@/server/store-repository';
import { ProductDetail } from '@/src/screens/ProductDetail';

type Props = {
  params: Promise<{ storeId: string; productId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const result = await getPublicProductByStore(resolvedParams.storeId, resolvedParams.productId);

  if (!result) {
    return {
      title: 'Product not found',
    };
  }

  return {
    title: `${result.product.name} | ${result.store.name}`,
    description: result.product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const result = await getPublicProductByStore(resolvedParams.storeId, resolvedParams.productId);

  if (!result) {
    notFound();
  }

  return <ProductDetail storefront={result} productId={resolvedParams.productId} />;
}
