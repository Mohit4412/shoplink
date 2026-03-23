import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordWithToken } from '@/server/auth';

export async function POST(request: NextRequest) {
  const { token, password } = await request.json();

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const success = await resetPasswordWithToken(token, password);
  if (!success) {
    return NextResponse.json({ error: 'This link is invalid or has expired.' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
