import { NextRequest, NextResponse } from 'next/server';
import { getRequestSessionUser } from '@/server/auth';
import { getMerchantBundleByUsername, updateStoreDetails } from '@/server/store-repository';
import {
  createStripeAccountLink,
  createStripeConnectedAccount,
  getStripeConnectedAccount,
  isStripeConnectEnabled,
} from '@/server/stripe-connect';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'https://myshoplink.site';

async function getOrCreateStripeLink(username: string, email: string) {
  if (!isStripeConnectEnabled()) {
    throw new Error('Stripe Connect is not configured on this workspace.');
  }

  const bundle = await getMerchantBundleByUsername(username);
  if (!bundle) {
    throw new Error('Store not found.');
  }

  const currentPaymentSettings = bundle.store.paymentSettings ?? {};
  const stripeAccount = currentPaymentSettings.stripe?.accountId
    ? await getStripeConnectedAccount(currentPaymentSettings.stripe.accountId)
    : await createStripeConnectedAccount({ email, country: 'IN' });

  const paymentSettings = {
    ...currentPaymentSettings,
    checkoutProvider: currentPaymentSettings.checkoutProvider ?? 'manual',
    enableOnlineCheckout: currentPaymentSettings.enableOnlineCheckout ?? false,
    stripe: stripeAccount,
  };

  await updateStoreDetails(username, { paymentSettings });

  const url = await createStripeAccountLink({
    accountId: stripeAccount.accountId,
    refreshUrl: `${APP_URL}/api/payments/stripe/connect`,
    returnUrl: `${APP_URL}/settings?view=payments&stripe=return`,
  });

  return { url, paymentSettings };
}

export async function GET(request: NextRequest) {
  const sessionUser = await getRequestSessionUser(request);
  if (!sessionUser) {
    return NextResponse.redirect(new URL('/signup', APP_URL));
  }

  try {
    const result = await getOrCreateStripeLink(sessionUser.username, sessionUser.email);
    return NextResponse.redirect(result.url);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to start Stripe onboarding.';
    return NextResponse.redirect(new URL(`/settings?view=payments&stripe=error&message=${encodeURIComponent(message)}`, APP_URL));
  }
}

export async function POST(request: NextRequest) {
  const sessionUser = await getRequestSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await getOrCreateStripeLink(sessionUser.username, sessionUser.email);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to start Stripe onboarding.' },
      { status: 500 },
    );
  }
}
