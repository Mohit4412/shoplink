import { NextRequest, NextResponse } from 'next/server';
import { getRequestSessionUser } from '@/server/auth';
import { getMerchantBundleByUsername, updateStoreDetails } from '@/server/store-repository';
import { getStripeConnectedAccount, isStripeConnectEnabled } from '@/server/stripe-connect';

export async function POST(request: NextRequest) {
  const sessionUser = await getRequestSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isStripeConnectEnabled()) {
    return NextResponse.json({ error: 'Stripe Connect is not configured.' }, { status: 500 });
  }

  const bundle = await getMerchantBundleByUsername(sessionUser.username);
  const accountId = bundle?.store.paymentSettings?.stripe?.accountId;
  if (!bundle || !accountId) {
    return NextResponse.json({ error: 'Stripe is not connected for this store.' }, { status: 400 });
  }

  try {
    const stripe = await getStripeConnectedAccount(accountId);
    const paymentSettings = {
      ...(bundle.store.paymentSettings ?? {}),
      stripe,
    };
    const updated = await updateStoreDetails(sessionUser.username, { paymentSettings });
    return NextResponse.json({
      paymentSettings: updated?.store.paymentSettings ?? paymentSettings,
      store: updated?.store ?? bundle.store,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to sync Stripe account status.' },
      { status: 500 },
    );
  }
}
