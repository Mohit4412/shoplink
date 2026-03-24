import { NextRequest, NextResponse } from 'next/server';
import { applySessionCookie, createSession, createUser, getUserCount, updateAuthUserProfile } from '@/server/auth';
import { replaceMerchantBundle } from '@/server/store-repository';
import { getStarterMerchantBundle } from '@/src/lib/default-state';
import { rateLimit, getClientIp, rateLimitedResponse } from '@/server/rate-limit';

// Set EARLY_ACCESS_ENABLED=true in .env to activate free Pro trials on signup.
// First 100 users get 3 months free, everyone after gets 14 days free.
const EARLY_ACCESS_SLOTS = 100;
const EARLY_ACCESS_ENABLED = process.env.EARLY_ACCESS_ENABLED === 'true';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = rateLimit(`signup:${ip}`, { limit: 5, windowSecs: 60 * 60 });
  if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

  const body = await request.json();
  const email = String(body?.email ?? '').trim().toLowerCase();
  const password = String(body?.password ?? '');
  const username = String(body?.username ?? '').trim().toLowerCase();
  const firstName = String(body?.firstName ?? '').trim();
  const lastName = String(body?.lastName ?? '').trim();
  const whatsappNumber = String(body?.whatsappNumber ?? '').trim();

  if (!email || !password || !username || !whatsappNumber) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const currentUserCount = EARLY_ACCESS_ENABLED ? await getUserCount() : 0;
  const isEarlyAccess = EARLY_ACCESS_ENABLED && currentUserCount < EARLY_ACCESS_SLOTS;

  const user = await createUser({ email, password, username, firstName, lastName, whatsappNumber });
  if (!user) {
    return NextResponse.json({ error: 'Email or username is already in use' }, { status: 409 });
  }

  if (EARLY_ACCESS_ENABLED) {
    const renewalDate = new Date();
    if (isEarlyAccess) {
      renewalDate.setMonth(renewalDate.getMonth() + 3); // 3 months for first 100
    } else {
      renewalDate.setDate(renewalDate.getDate() + 14);  // 14-day trial for everyone else
    }
    user.plan = 'Pro';
    user.subscriptionRenewalDate = renewalDate.toISOString();
    await updateAuthUserProfile(user.id, {
      plan: 'Pro',
      subscriptionRenewalDate: renewalDate.toISOString(),
    });
  }

  await replaceMerchantBundle(getStarterMerchantBundle(user));

  const session = await createSession(user.id);
  const response = NextResponse.json({ user });
  applySessionCookie(response, session.token, session.expiresAt);
  return response;
}
