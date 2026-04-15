import { NextRequest, NextResponse } from 'next/server';
import { applySessionCookie, getRequestSessionUser, getSessionCookieName, refreshSession } from '@/server/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(getSessionCookieName())?.value ?? null;
  const user = await getRequestSessionUser(request);
  const response = NextResponse.json({ user });

  if (user && token) {
    const expiresAt = await refreshSession(token);
    if (expiresAt) {
      applySessionCookie(response, token, expiresAt);
    }
  }

  return response;
}
