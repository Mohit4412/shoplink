import { NextRequest, NextResponse } from 'next/server';
import { getPublicProductByStore } from '@/server/store-repository';

// Slug format: {username}--{productId}
// e.g. /api/p/mystore--abc123

type RouteContext = { params: Promise<{ slug: string }> };

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const separatorIndex = slug.indexOf('--');

  if (separatorIndex === -1) {
    return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 });
  }

  const username = slug.slice(0, separatorIndex);
  const productId = slug.slice(separatorIndex + 2);

  if (!username || !productId) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }

  const result = await getPublicProductByStore(username, productId);

  if (!result) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({
    product: result.product,
    store: {
      name: result.store.name,
      currency: result.store.currency,
      whatsappNumber: result.user.whatsappNumber,
    },
    username: result.user.username,
  });
}
