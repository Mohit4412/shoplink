import { NextRequest, NextResponse } from 'next/server';
import { applySessionCookie, createSession, createUser } from '@/server/auth';
import { replaceMerchantBundle } from '@/server/store-repository';
import { getStarterMerchantBundle } from '@/src/lib/default-state';

export async function POST(request: NextRequest) {
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

  await replaceMerchantBundle(getStarterMerchantBundle(user));

  const session = await createSession(user.id);
  const response = NextResponse.json({ user });
  applySessionCookie(response, session.token, session.expiresAt);
  return response;
}
