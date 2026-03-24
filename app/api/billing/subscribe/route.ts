import { NextRequest, NextResponse } from 'next/server';
import { getRequestSessionUser } from '@/server/auth';
import { createRazorpaySubscription, isRazorpayEnabled } from '@/server/razorpay';

export async function POST(request: NextRequest) {
  const user = await getRequestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isRazorpayEnabled()) {
    return NextResponse.json({ error: 'Billing is not configured' }, { status: 503 });
  }

  try {
    const subscription = await createRazorpaySubscription({
      customerEmail: user.email,
      customerName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username,
      customerContact: user.whatsappNumber,
    });

    return NextResponse.json({ subscriptionId: subscription.id });
  } catch (err) {
    console.error('Failed to create Razorpay subscription:', err);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}
