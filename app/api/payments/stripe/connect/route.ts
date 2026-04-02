import { NextRequest, NextResponse } from 'next/server';
import { getRequestSessionUser } from '@/server/auth';
import {
  createStripeOAuthAuthorizeUrl,
  getStripeConnectClientId,
  isStripeOAuthEnabled,
} from '@/server/stripe-connect';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'https://myshoplink.site';

export async function GET(request: NextRequest) {
  const sessionUser = await getRequestSessionUser(request);
  if (!sessionUser) {
    return NextResponse.redirect(new URL('/signup', APP_URL));
  }

  try {
    if (!isStripeOAuthEnabled()) {
      throw new Error('Stripe Standard is not configured on this workspace.');
    }
    const redirectUri = `${APP_URL}/api/payments/stripe/callback`;
    const url = createStripeOAuthAuthorizeUrl({
      state: sessionUser.username,
      redirectUri,
    });
    return NextResponse.redirect(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to start Stripe onboarding.';
    return NextResponse.redirect(new URL(`/settings?view=payments&provider=stripe&stripe=error&message=${encodeURIComponent(message)}`, APP_URL));
  }
}

export async function POST(request: NextRequest) {
  const sessionUser = await getRequestSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!isStripeOAuthEnabled()) {
      throw new Error('Stripe Standard is not configured on this workspace.');
    }
    const redirectUri = `${APP_URL}/api/payments/stripe/callback`;
    const url = createStripeOAuthAuthorizeUrl({
      state: sessionUser.username,
      redirectUri,
    });
    return NextResponse.json({ url, clientId: getStripeConnectClientId() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to start Stripe onboarding.' },
      { status: 500 },
    );
  }
}
