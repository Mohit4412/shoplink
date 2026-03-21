import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicStorefrontByUsername } from '@/server/store-repository';
import { StoreFront } from '@/src/screens/StoreFront';

type Props = {
  params: Promise<{ storeId: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const storefront = await getPublicStorefrontByUsername(resolvedParams.storeId);
  if (!storefront) {
    return {
      title: 'Store not found',
    };
  }
  const store = storefront.store;
  const title = `${store.name} — Shop on WhatsApp`;
  
  return {
    title,
    description: store.tagline,
    openGraph: {
      title,
      description: store.tagline,
      images: store.logoUrl ? [store.logoUrl] : ['https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1200&auto=format&fit=crop'],
    },
    twitter: {
      card: 'summary_large_image',
    }
  };
}

export default async function StorePage({ params }: Props) {
  const resolvedParams = await params;
  const storefront = await getPublicStorefrontByUsername(resolvedParams.storeId);

  if (!storefront) {
    notFound();
  }

  return <StoreFront storefront={storefront} />;
}
