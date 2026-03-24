import crypto from 'crypto';

function getRazorpayAuth() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured');
  }
  return { keyId, keySecret };
}

export function isRazorpayEnabled() {
  return Boolean(
    process.env.RAZORPAY_KEY_ID?.trim() &&
    process.env.RAZORPAY_KEY_SECRET?.trim() &&
    process.env.RAZORPAY_PLAN_ID?.trim()
  );
}

async function razorpayRequest<T>(
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  const { keyId, keySecret } = getRazorpayAuth();
  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.description ?? `Razorpay error: ${response.status}`);
  }
  return data as T;
}

export interface RazorpaySubscription {
  id: string;
  status: string;
  current_end: number | null;
  charge_at: number | null;
}

export async function createRazorpaySubscription(opts: {
  customerEmail: string;
  customerName: string;
  customerContact: string;
}): Promise<RazorpaySubscription> {
  const planId = process.env.RAZORPAY_PLAN_ID?.trim();
  if (!planId) throw new Error('RAZORPAY_PLAN_ID is not configured');

  return razorpayRequest<RazorpaySubscription>('POST', '/subscriptions', {
    plan_id: planId,
    total_count: 120, // 10 years max — effectively unlimited
    quantity: 1,
    customer_notify: 1,
    notify_info: {
      notify_email: opts.customerEmail,
    },
  });
}

export async function cancelRazorpaySubscription(subscriptionId: string) {
  return razorpayRequest('POST', `/subscriptions/${subscriptionId}/cancel`, {
    cancel_at_cycle_end: 1,
  });
}

export async function getRazorpaySubscription(subscriptionId: string): Promise<RazorpaySubscription> {
  return razorpayRequest<RazorpaySubscription>('GET', `/subscriptions/${subscriptionId}`);
}

export function verifyRazorpayWebhook(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!secret) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
