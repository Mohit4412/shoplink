import { NextRequest, NextResponse } from 'next/server';
import { getRequestSessionUser } from '@/server/auth';
import { getDashboardData, seedDashboardDataIfEmpty } from '@/server/dashboard-repository';

export async function GET(request: NextRequest) {
  const user = await getRequestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await seedDashboardDataIfEmpty(user.username);
  return NextResponse.json(await getDashboardData(user.username));
}
