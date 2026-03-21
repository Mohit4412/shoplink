import { NextRequest, NextResponse } from 'next/server';
import { getRequestSessionUser } from '@/server/auth';

export async function GET(request: NextRequest) {
  const user = await getRequestSessionUser(request);
  return NextResponse.json({ user });
}
