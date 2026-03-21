import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie, deleteSession, getSessionCookieName } from '@/server/auth';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(getSessionCookieName())?.value;
  if (token) {
    await deleteSession(token);
  }

  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
