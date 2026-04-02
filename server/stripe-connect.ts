import { createHmac, timingSafeEqual } from 'crypto';
import type { StripePaymentAccount } from '@/src/types';

const STRIPE_API_BASE = 'https://api.stripe.com/v1';
const STRIPE_CONNECT_BASE = 'https://connect.stripe.com';

type Primitive = string | number | boolean | null | undefined;

interface StripeConnectAccountResponse {
  id: string;
  email?: string | null;
  business_profile?: {
    name?: string | null;
  } | null;
  details_submitted?: boolean;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
}

function getEnv(name: string) {
  return process.env[name]?.trim() || '';
}

export function getStripeSecretKey() {
  return getEnv('STRIPE_SECRET_KEY');
}

export function getStripeConnectClientId() {
  return getEnv('STRIPE_CONNECT_CLIENT_ID');
}

export function getStripeWebhookSecret() {
  return getEnv('STRIPE_CONNECT_WEBHOOK_SECRET') || getEnv('STRIPE_WEBHOOK_SECRET');
}

export function getStripeConnectDefaultCountry() {
  return getEnv('STRIPE_CONNECT_COUNTRY') || 'IN';
}

export function isStripeConnectEnabled() {
  return Boolean(getStripeSecretKey());
}

export function isStripeOAuthEnabled() {
  return Boolean(getStripeSecretKey() && getStripeConnectClientId());
}

export function getStripeApplicationFeeBps() {
  const raw = Number(getEnv('STRIPE_CONNECT_APPLICATION_FEE_BPS'));
  if (!Number.isFinite(raw) || raw < 0) {
    return 0;
  }
  return Math.min(Math.round(raw), 10_000);
}

function appendFormValue(params: URLSearchParams, key: string, value: Primitive | Primitive[] | Record<string, unknown>) {
  if (value === null || value === undefined || value === '') {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => appendFormValue(params, `${key}[]`, item));
    return;
  }

  if (typeof value === 'object') {
    for (const [nestedKey, nestedValue] of Object.entries(value)) {
      appendFormValue(params, `${key}[${nestedKey}]`, nestedValue as Primitive | Primitive[] | Record<string, unknown>);
    }
    return;
  }

  params.append(key, String(value));
}

async function stripeRequest<T>(
  method: 'GET' | 'POST',
  pathname: string,
  body?: Record<string, unknown>,
) {
  const secretKey = getStripeSecretKey();
  if (!secretKey) {
    throw new Error('Stripe is not configured.');
  }

  const url = new URL(pathname, STRIPE_API_BASE);
  const headers: HeadersInit = {
    Authorization: `Bearer ${secretKey}`,
  };
  let payload: string | undefined;

  if (method === 'GET' && body) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      appendFormValue(params, key, value as Primitive | Primitive[] | Record<string, unknown>);
    }
    url.search = params.toString();
  } else if (body) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      appendFormValue(params, key, value as Primitive | Primitive[] | Record<string, unknown>);
    }
    payload = params.toString();
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  const response = await fetch(url, {
    method,
    headers,
    body: payload,
    cache: 'no-store',
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const message = data?.error?.message || 'Stripe request failed.';
    throw new Error(message);
  }
  return data as T;
}

export function toStripeMinorAmount(amount: number, currency: string) {
  const zeroDecimalCurrencies = new Set(['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf']);
  return zeroDecimalCurrencies.has(currency.toLowerCase())
    ? Math.round(amount)
    : Math.round(amount * 100);
}

export function mapStripeAccount(account: StripeConnectAccountResponse): StripePaymentAccount {
  return {
    accountId: account.id,
    accountEmail: account.email ?? undefined,
    accountDisplayName: account.business_profile?.name ?? undefined,
    onboardingComplete: Boolean(account.details_submitted && account.charges_enabled),
    detailsSubmitted: Boolean(account.details_submitted),
    chargesEnabled: Boolean(account.charges_enabled),
    payoutsEnabled: Boolean(account.payouts_enabled),
    lastSyncedAt: new Date().toISOString(),
  };
}

export async function getStripeConnectedAccount(accountId: string) {
  const account = await stripeRequest<StripeConnectAccountResponse>('GET', `/accounts/${accountId}`);
  return mapStripeAccount(account);
}

export function createStripeOAuthAuthorizeUrl(input: {
  state: string;
  redirectUri: string;
}) {
  const clientId = getStripeConnectClientId();
  if (!clientId) {
    throw new Error('Stripe Connect client ID is not configured.');
  }

  const url = new URL('/oauth/authorize', STRIPE_CONNECT_BASE);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('scope', 'read_write');
  url.searchParams.set('redirect_uri', input.redirectUri);
  url.searchParams.set('state', input.state);
  return url.toString();
}

export async function exchangeStripeOAuthCode(input: {
  code: string;
  redirectUri: string;
}) {
  const clientId = getStripeConnectClientId();
  if (!clientId) {
    throw new Error('Stripe Connect client ID is not configured.');
  }

  const response = await stripeRequest<{
    stripe_user_id: string;
  }>('POST', 'https://connect.stripe.com/oauth/token', {
    grant_type: 'authorization_code',
    code: input.code,
    client_id: clientId,
    redirect_uri: input.redirectUri,
  });

  return response;
}

export async function createStripeCheckoutSession(input: {
  accountId: string;
  productName: string;
  productDescription?: string;
  imageUrl?: string;
  amount: number;
  currency: string;
  quantity: number;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata: Record<string, string>;
}) {
  const unitAmount = toStripeMinorAmount(input.amount, input.currency);
  const applicationFeeBps = getStripeApplicationFeeBps();
  const totalAmount = unitAmount * input.quantity;
  const applicationFeeAmount = applicationFeeBps > 0
    ? Math.floor(totalAmount * applicationFeeBps / 10_000)
    : 0;

  const response = await stripeRequest<{ id: string; url: string }>('POST', '/checkout/sessions', {
    mode: 'payment',
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    customer_email: input.customerEmail,
    client_reference_id: input.metadata.order_id,
    metadata: input.metadata,
    line_items: [
      {
        quantity: input.quantity,
        price_data: {
          currency: input.currency.toLowerCase(),
          unit_amount: unitAmount,
          product_data: {
            name: input.productName,
            description: input.productDescription,
            images: input.imageUrl ? [input.imageUrl] : undefined,
          },
        },
      },
    ],
    payment_intent_data: {
      transfer_data: {
        destination: input.accountId,
      },
      application_fee_amount: applicationFeeAmount > 0 ? applicationFeeAmount : undefined,
      metadata: input.metadata,
    },
  });

  return response;
}

export function verifyStripeWebhookSignature(rawBody: string, signatureHeader: string) {
  const secret = getStripeWebhookSecret();
  if (!secret) {
    throw new Error('Stripe webhook secret is not configured.');
  }

  const pairs = signatureHeader.split(',').map((item) => item.trim());
  const timestamp = pairs.find((item) => item.startsWith('t='))?.slice(2);
  const signatures = pairs.filter((item) => item.startsWith('v1=')).map((item) => item.slice(3));

  if (!timestamp || signatures.length === 0) {
    throw new Error('Missing Stripe signature parts.');
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = createHmac('sha256', secret).update(signedPayload).digest('hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  const valid = signatures.some((signature) => {
    const actualBuffer = Buffer.from(signature, 'hex');
    if (actualBuffer.length !== expectedBuffer.length) {
      return false;
    }
    return timingSafeEqual(actualBuffer, expectedBuffer);
  });

  if (!valid) {
    throw new Error('Invalid Stripe webhook signature.');
  }

  return JSON.parse(rawBody) as {
    type: string;
    data?: { object?: Record<string, unknown> };
  };
}
