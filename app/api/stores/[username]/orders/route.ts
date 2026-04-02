import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createOrder, updateOrderById } from '@/server/dashboard-repository';
import { getPublicStorefrontByUsername } from '@/server/store-repository';
import { createStripeCheckoutSession, isStripeConnectEnabled } from '@/server/stripe-connect';
import { serializeOrderLeadNotes } from '@/src/utils/orderLeads';
import { generateOrderToken } from '@/src/utils/orderToken';

type RouteContext = {
  params: Promise<{ username: string }>;
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'https://myshoplink.site';

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
    const {
      productId,
      revenue,
      quantity = 1,
      customerName,
      customerPhone,
      email,
      city,
      address,
      pincode,
      paymentMethod,
      notes,
      source,
      selectedVariants,
    } = body ?? {};

    if (!productId || typeof revenue !== 'number' || !customerName || !customerPhone) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Verify the product belongs to this store and is active
    const product = storefront.products.find(p => p.id === productId && p.status === 'Active');
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const orderId = `o_${randomUUID()}`;

    const isStripeCheckout = paymentMethod === 'stripe';

    if (isStripeCheckout) {
      const paymentSettings = storefront.store.paymentSettings;
      const stripeAccountId = paymentSettings?.stripe?.accountId;
      const onlineCheckoutEnabled =
        paymentSettings?.enableOnlineCheckout &&
        paymentSettings.checkoutProvider === 'stripe' &&
        paymentSettings.stripe?.onboardingComplete &&
        paymentSettings.stripe?.chargesEnabled;

      if (!isStripeConnectEnabled() || !stripeAccountId || !onlineCheckoutEnabled) {
        return NextResponse.json({ error: 'Online checkout is not available for this store yet.' }, { status: 400 });
      }
    }

    await createOrder(username, {
      id: orderId,
      productId,
      quantity: Number(quantity) > 0 ? Number(quantity) : 1,
      revenue,
      date: new Date().toISOString(),
      notes: serializeOrderLeadNotes(
        {
          customerName,
          customerPhone,
          email,
          city,
          address,
          pincode,
          paymentMethod,
          source: source === 'link' || source === 'website' ? source : undefined,
          selectedVariants: selectedVariants && typeof selectedVariants === 'object' ? selectedVariants : undefined,
        },
        notes
      ),
      status: isStripeCheckout ? 'checkout_pending' : 'pending',
      paymentProvider: isStripeCheckout ? 'stripe' : 'manual',
      paymentStatus: isStripeCheckout ? 'pending' : 'unpaid',
    });

    // Generate one-click action tokens for the WhatsApp message
    const [confirmToken, declineToken] = await Promise.all([
      generateOrderToken(orderId, 'confirm'),
      generateOrderToken(orderId, 'decline'),
    ]);

    const confirmUrl = `${APP_URL}/api/orders/${orderId}/confirm?token=${confirmToken}`;
    const declineUrl = `${APP_URL}/api/orders/${orderId}/decline?token=${declineToken}`;

    if (isStripeCheckout) {
      try {
        const checkoutSession = await createStripeCheckoutSession({
          accountId: storefront.store.paymentSettings!.stripe!.accountId,
          productName: product.name,
          productDescription: product.description,
          imageUrl: product.imageUrl,
          amount: revenue / Math.max(Number(quantity) > 0 ? Number(quantity) : 1, 1),
          currency: storefront.store.currency,
          quantity: Number(quantity) > 0 ? Number(quantity) : 1,
          successUrl: `${APP_URL}/p/${username}--${product.id}?checkout=success&order=${orderId}`,
          cancelUrl: `${APP_URL}/p/${username}--${product.id}?checkout=cancel&order=${orderId}`,
          customerEmail: typeof email === 'string' ? email : undefined,
          metadata: {
            order_id: orderId,
            username,
            product_id: product.id,
          },
        });

        await updateOrderById(username, orderId, {
          paymentProvider: 'stripe',
          paymentStatus: 'pending',
          paymentReference: checkoutSession.id,
        });

        return NextResponse.json({
          ok: true,
          orderId,
          checkoutUrl: checkoutSession.url,
          paymentProvider: 'stripe',
        });
      } catch (error) {
        await updateOrderById(username, orderId, {
          status: 'payment_failed',
          paymentProvider: 'stripe',
          paymentStatus: 'failed',
        });
        throw error;
      }
    }

    return NextResponse.json({ ok: true, orderId, confirmUrl, declineUrl, paymentProvider: 'manual' });
  } catch (err) {
    console.error('[POST /api/stores/[username]/orders]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
