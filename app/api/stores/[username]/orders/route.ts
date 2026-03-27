import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createOrder } from '@/server/dashboard-repository';
import { getPublicStorefrontByUsername } from '@/server/store-repository';

type RouteContext = {
  params: Promise<{ username: string }>;
};

// Public endpoint — no auth required. Called when a customer taps "Order on WhatsApp"
// from a product page. Creates a pending order for the merchant to confirm/decline.
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { username } = await params;

    // Verify the store exists
    const storefront = await getPublicStorefrontByUsername(username);
    if (!storefront) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const body = await request.json();
    const { productId, revenue } = body ?? {};

    if (!productId || typeof revenue !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Verify the product belongs to this store and is active
    const product = storefront.products.find(p => p.id === productId && p.status === 'Active');
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await createOrder(username, {
      id: `o_${randomUUID()}`,
      productId,
      quantity: 1,
      revenue,
      date: new Date().toISOString(),
      notes: '',
      status: 'pending',
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[POST /api/stores/[username]/orders]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
