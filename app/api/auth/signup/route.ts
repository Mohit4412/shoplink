import { NextRequest, NextResponse } from 'next/server';
import { applySessionCookie, createSession, createUser, getUserCount, updateAuthUserProfile } from '@/server/auth';
import { replaceMerchantBundle } from '@/server/store-repository';
import { getStarterMerchantBundle } from '@/src/lib/default-state';
import { rateLimit, getClientIp, rateLimitedResponse } from '@/server/rate-limit';

const EARLY_ACCESS_SLOTS = 100;

export async function POST(request: NextRequest) {
  // 5 signups per IP per hour
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

  // Check slot before creating — count is the number of existing users
  const currentUserCount = await getUserCount();
  const isEarlyAccess = currentUserCount < EARLY_ACCESS_SLOTS;

  const user = await createUser({
    email,
    password,
    username,
    firstName,
    lastName,
    whatsappNumber,
  });

  if (!user) {
    return NextResponse.json({ error: 'Email or username is already in use' }, { status: 409 });
  }

  // First 100 users: 3 months Pro free. Everyone else: 14-day Pro trial.
  const renewalDate = new Date();
  if (isEarlyAccess) {
    renewalDate.setMonth(renewalDate.getMonth() + 3);
  } else {
    renewalDate.setDate(renewalDate.getDate() + 14);
  }
  user.plan = 'Pro';
  user.subscriptionRenewalDate = renewalDate.toISOString();
  await updateAuthUserProfile(user.id, {
    plan: 'Pro',
    subscriptionRenewalDate: renewalDate.toISOString(),
  });

  await replaceMerchantBundle(getStarterMerchantBundle(user));

  const session = await createSession(user.id);
  const response = NextResponse.json({ user });
  applySessionCookie(response, session.token, session.expiresAt);
  return response;
}
