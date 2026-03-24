import { NextRequest, NextResponse } from 'next/server';
import { getRequestSessionUser, updateUserSubscription } from '@/server/auth';
import { getRazorpaySubscription, isRazorpayEnabled } from '@/server/razorpay';

export async function POST(request: NextRequest) {
  const user = await getRequestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const subscriptionId = String(body?.subscriptionId ?? '').trim();

  if (!subscriptionId) {
    return NextResponse.json({ error: 'Missing subscriptionId' }, { status: 400 });
  }

  // If Razorpay is configured, verify the subscription is actually active
  if (isRazorpayEnabled()) {
    try {
      const sub = await getRazorpaySubscription(subscriptionId);
      // Accept created/authenticated/active states — webhook will confirm later
      const validStates = ['created', 'authenticated', 'active'];
      if (!validStates.includes(sub.status)) {
        return NextResponse.json({ error: 'Subscription is not active' }, { status: 400 });
      }

      const renewalDate = sub.current_end
        ? new Date(sub.current_end * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const updated = await updateUserSubscription(user.id, {
        plan: 'Pro',
        subscriptionRenewalDate: renewalDate,
        razorpaySubscriptionId: subscriptionId,
      });

      return NextResponse.json({ user: updated });
    } catch (err) {
      console.error('Failed to verify subscription:', err);
      return NextResponse.json({ error: 'Failed to verify subscription' }, { status: 500 });
    }
  }

  // Fallback for local dev without Razorpay configured
  const renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const updated = await updateUserSubscription(user.id, {
    plan: 'Pro',
    subscriptionRenewalDate: renewalDate,
    razorpaySubscriptionId: subscriptionId,
  });

  return NextResponse.json({ user: updated });
}
