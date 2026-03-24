import { NextRequest, NextResponse } from 'next/server';
import { applySessionCookie, authenticateUser, createSession } from '@/server/auth';
import { rateLimit, getClientIp, rateLimitedResponse } from '@/server/rate-limit';

export async function POST(request: NextRequest) {
  // 10 attempts per IP per 15 minutes
  const ip = getClientIp(request);
  const rl = rateLimit(`login:${ip}`, { limit: 10, windowSecs: 15 * 60 });
  if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

  const body = await request.json();
  const email = String(body?.email ?? '').trim().toLowerCase();
  const password = String(body?.password ?? '');

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const user = await authenticateUser(email, password);
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const session = await createSession(user.id);
  const response = NextResponse.json({ user });
  applySessionCookie(response, session.token, session.expiresAt);
  return response;
}
