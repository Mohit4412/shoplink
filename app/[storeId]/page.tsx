import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicStorefrontByUsername } from '@/server/store-repository';
import { StoreFront } from '@/src/screens/StoreFront';

type Props = {
  params: Promise<{ storeId: string }>
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const storefront = await getPublicStorefrontByUsername(resolvedParams.storeId);

  if (!storefront) {
    return { title: 'Store not found' };
  }

  const { store, user } = storefront;
  const title = store.name || resolvedParams.storeId;
  const description = store.tagline || store.bio || `Shop ${title} on WhatsApp`;
  const image = store.banners?.[0] || store.logoUrl || null;

  return {
    title: `${title} — Shop on WhatsApp`,
    description,
    openGraph: {
      title: `${title} — Shop on WhatsApp`,
      description,
      type: 'website',
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: `${title} — Shop on WhatsApp`,
      description,
      ...(image ? { images: [image] } : {}),
    },
    other: {
      'og:site_name': 'MyShopLink',
    },
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
