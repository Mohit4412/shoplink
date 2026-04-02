import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrderById } from '@/server/dashboard-repository';
import { verifyStripeWebhookSignature } from '@/server/stripe-connect';

type StripeSessionObject = {
  id?: string;
  metadata?: Record<string, string>;
};

function getSessionOrderDetails(object: StripeSessionObject) {
  const orderId = object.metadata?.order_id;
  const username = object.metadata?.username;
  return orderId && username ? { orderId, username } : null;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  let event: { type: string; data?: { object?: Record<string, unknown> } };
  try {
    event = verifyStripeWebhookSignature(rawBody, signature);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid webhook signature.' },
      { status: 400 },
    );
  }

  const object = (event.data?.object ?? {}) as StripeSessionObject;
  const details = getSessionOrderDetails(object);
  if (!details) {
    return NextResponse.json({ received: true });
  }

  const existing = await getOrderById(details.orderId);
  if (!existing || existing.username !== details.username) {
    return NextResponse.json({ received: true });
  }

  if (event.type === 'checkout.session.completed') {
    await updateOrderById(details.username, details.orderId, {
      status: 'paid',
      paymentProvider: 'stripe',
      paymentStatus: 'paid',
      paymentReference: object.id,
    });
  }

  if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
    await updateOrderById(details.username, details.orderId, {
      status: 'payment_failed',
      paymentProvider: 'stripe',
      paymentStatus: 'failed',
      paymentReference: object.id,
    });
  }

  return NextResponse.json({ received: true });
}
