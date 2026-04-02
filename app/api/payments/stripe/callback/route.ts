import { NextRequest, NextResponse } from 'next/server';
import { getRequestSessionUser } from '@/server/auth';
import { getMerchantBundleByUsername, updateStoreDetails } from '@/server/store-repository';
import {
  exchangeStripeOAuthCode,
  getStripeConnectedAccount,
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

    const error = request.nextUrl.searchParams.get('error');
    const errorDescription = request.nextUrl.searchParams.get('error_description');
    if (error) {
      const message = errorDescription || 'Stripe connection was cancelled.';
      return NextResponse.redirect(
        new URL(`/settings?view=payments&provider=stripe&stripe=error&message=${encodeURIComponent(message)}`, APP_URL),
      );
    }

    const state = request.nextUrl.searchParams.get('state');
    const code = request.nextUrl.searchParams.get('code');
    if (!code || !state) {
      throw new Error('Missing Stripe OAuth callback data.');
    }
    if (state !== sessionUser.username) {
      throw new Error('Stripe connection state did not match the signed-in merchant.');
    }

    const redirectUri = `${APP_URL}/api/payments/stripe/callback`;
    const oauth = await exchangeStripeOAuthCode({ code, redirectUri });
    const stripe = await getStripeConnectedAccount(oauth.stripe_user_id);

    const bundle = await getMerchantBundleByUsername(sessionUser.username);
    if (!bundle) {
      throw new Error('Store not found.');
    }

    await updateStoreDetails(sessionUser.username, {
      paymentSettings: {
        ...(bundle.store.paymentSettings ?? {}),
        checkoutProvider: bundle.store.paymentSettings?.checkoutProvider ?? 'manual',
        enableOnlineCheckout: bundle.store.paymentSettings?.enableOnlineCheckout ?? false,
        stripe,
      },
    });

    return NextResponse.redirect(new URL('/settings?view=payments&provider=stripe&stripe=return', APP_URL));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to complete Stripe connection.';
    return NextResponse.redirect(
      new URL(`/settings?view=payments&provider=stripe&stripe=error&message=${encodeURIComponent(message)}`, APP_URL),
    );
  }
}
