import { NextRequest, NextResponse } from 'next/server';
import { updateUserSubscription } from '@/server/auth';
import { isSupabaseEnabled, supabaseSelect } from '@/server/supabase';
import { verifyRazorpayWebhook } from '@/server/razorpay';
import { db } from '@/server/db';

async function getUserBySubscriptionId(subscriptionId: string) {
  if (isSupabaseEnabled()) {
    const rows = await supabaseSelect<{ id: string }>('users', {
      razorpay_subscription_id: `eq.${subscriptionId}`,
      select: 'id',
      limit: 1,
    });
    return rows[0]?.id ?? null;
  }
  const row = db?.prepare('SELECT id FROM users WHERE razorpay_subscription_id = ?').get(subscriptionId) as { id: string } | undefined;
  return row?.id ?? null;
}

async function getUserByEmail(email: string) {
  if (isSupabaseEnabled()) {
    const rows = await supabaseSelect<{ id: string }>('users', {
      email: `eq.${email}`,
      select: 'id',
      limit: 1,
    });
    return rows[0]?.id ?? null;
  }
  const row = db?.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: string } | undefined;
  return row?.id ?? null;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature') ?? '';

  if (!verifyRazorpayWebhook(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event: { event: string; payload: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const subscription = (event.payload?.subscription as { entity?: Record<string, unknown> })?.entity;
  if (!subscription) {
    return NextResponse.json({ ok: true });
  }

  const subscriptionId = subscription.id as string;
  const customerEmail = (subscription.notes as Record<string, string> | undefined)?.email
    ?? (event.payload?.payment as { entity?: { email?: string } })?.entity?.email;

  // Find user by subscription ID first, fall back to email
  let userId = await getUserBySubscriptionId(subscriptionId);
  if (!userId && customerEmail) {
    userId = await getUserByEmail(customerEmail);
  }

  if (!userId) {
    // Unknown user — acknowledge but don't process
    return NextResponse.json({ ok: true });
  }

  const eventType = event.event;

  if (eventType === 'subscription.activated' || eventType === 'subscription.charged') {
    // Next billing date from Razorpay (Unix timestamp)
    const currentEnd = subscription.current_end as number | null;
    const renewalDate = currentEnd
      ? new Date(currentEnd * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await updateUserSubscription(userId, {
      plan: 'Pro',
      subscriptionRenewalDate: renewalDate,
      razorpaySubscriptionId: subscriptionId,
    });
  } else if (
    eventType === 'subscription.cancelled' ||
    eventType === 'subscription.completed' ||
    eventType === 'subscription.expired'
  ) {
    // Grace period: keep Pro for 3 more days, then downgrade
    const graceEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    await updateUserSubscription(userId, {
      plan: 'Pro',
      subscriptionRenewalDate: graceEnd,
      razorpaySubscriptionId: subscriptionId,
    });
  } else if (eventType === 'subscription.halted') {
    // Payment failed — immediate grace period
    const graceEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    await updateUserSubscription(userId, {
      plan: 'Pro',
      subscriptionRenewalDate: graceEnd,
      razorpaySubscriptionId: subscriptionId,
    });
  }

  return NextResponse.json({ ok: true });
}
