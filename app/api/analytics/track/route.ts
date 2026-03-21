import { NextRequest, NextResponse } from 'next/server';
import { trackClick, trackView } from '@/server/dashboard-repository';

function getCountryCode(request: NextRequest) {
  const candidates = [
    request.headers.get('x-vercel-ip-country'),
    request.headers.get('cf-ipcountry'),
    request.headers.get('x-country-code'),
  ];

  for (const candidate of candidates) {
    const normalized = String(candidate ?? '').trim().toUpperCase().replace(/[^A-Z]/g, '');
    if (normalized.length === 2) {
      return normalized;
    }
  }

  return undefined;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const username = String(body?.username ?? '').trim();
  const type = String(body?.type ?? '').trim();
  const source = typeof body?.source === 'string' ? body.source : undefined;
  const referrerHost = typeof body?.referrerHost === 'string' ? body.referrerHost : undefined;
  const pagePath = typeof body?.pagePath === 'string' ? body.pagePath : undefined;
  const countryCode = getCountryCode(request);

  if (!username || (type !== 'view' && type !== 'click')) {
    return NextResponse.json({ error: 'Invalid analytics payload' }, { status: 400 });
  }

  const analytics = await (type === 'view'
    ? trackView(username, { source, referrerHost, countryCode, pagePath })
    : trackClick(username, { source, referrerHost, countryCode, pagePath }));
  return NextResponse.json({ analytics });
}
