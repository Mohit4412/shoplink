import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicStorefrontByUsername } from '@/server/store-repository';
import { StoreFront } from '@/src/screens/StoreFront';

type Props = {
  params: Promise<{ storeId: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `${resolvedParams.storeId} — MyShopLink`,
    description: 'Shop and order via WhatsApp',
    openGraph: {
      title: `${resolvedParams.storeId} — MyShopLink`,
      description: 'Shop and order via WhatsApp',
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
