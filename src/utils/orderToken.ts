/**
 * Stateless HMAC tokens for one-click order confirm/decline links.
 * No DB column needed — the token is verified by recomputing the HMAC.
 *
 * Token = base64url( HMAC-SHA256( secret, "{orderId}:{action}" ) )
 */

const SECRET = process.env.ORDER_ACTION_SECRET ?? 'dev-order-secret-change-in-prod';

async function hmac(message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Buffer.from(sig).toString('base64url');
}

export async function generateOrderToken(orderId: string, action: 'confirm' | 'decline'): Promise<string> {
  return hmac(`${orderId}:${action}`);
}

export async function verifyOrderToken(orderId: string, action: 'confirm' | 'decline', token: string): Promise<boolean> {
  const expected = await hmac(`${orderId}:${action}`);
  // Constant-time comparison
  if (expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return diff === 0;
}
