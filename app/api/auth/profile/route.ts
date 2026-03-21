import { NextRequest, NextResponse } from 'next/server';
import { getRequestSessionUser, updateAuthUserProfile } from '@/server/auth';

export async function PATCH(request: NextRequest) {
  const sessionUser = await getRequestSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const updates = body?.user ?? {};
  if ('email' in updates) {
    return NextResponse.json({ error: 'Email cannot be changed here' }, { status: 400 });
  }

  const user = await updateAuthUserProfile(sessionUser.id, updates);
  if (user === 'USERNAME_TAKEN') {
    return NextResponse.json({ error: 'Username is already in use' }, { status: 409 });
  }
  if (!user) {
    return NextResponse.json({ error: 'Unable to update profile' }, { status: 400 });
  }

  return NextResponse.json({ user });
}
