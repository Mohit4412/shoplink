import { NextRequest, NextResponse } from 'next/server';
import { getRequestSessionUser } from '@/server/auth';
import { cancelRazorpaySubscription, isRazorpayEnabled } from '@/server/razorpay';

export async function POST(request: NextRequest) {
  const user = await getRequestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isRazorpayEnabled()) {
    return NextResponse.json({ error: 'Billing is not configured' }, { status: 503 });
  }

  if (!user.razorpaySubscriptionId) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
  }

  try {
    await cancelRazorpaySubscription(user.razorpaySubscriptionId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to cancel subscription:', err);
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}
