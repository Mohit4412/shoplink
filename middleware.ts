import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const APP_HOSTNAMES = [
  'localhost',
  '127.0.0.1',
  'vercel.app',
  'myshoplink.site',
];

function isAppHostname(host: string) {
  return APP_HOSTNAMES.some(h => host === h || host.endsWith(`.${h}`));
}

export async function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').split(':')[0]; // strip port
  const url = req.nextUrl.clone();

  // Let all app-owned hostnames pass through normally
  if (isAppHostname(host)) {
    return NextResponse.next();
  }

  // Custom domain — look up which store owns it via the internal API
  // We rewrite to the store's slug route so the user sees their domain
  try {
    const lookupUrl = new URL(
      `/api/domains/lookup?domain=${encodeURIComponent(host)}`,
      req.url
    );
    const res = await fetch(lookupUrl, { cache: 'no-store' });

    if (res.ok) {
      const { username } = await res.json();
      if (username) {
        url.pathname = `/${username}${url.pathname === '/' ? '' : url.pathname}`;
        return NextResponse.rewrite(url);
      }
    }
  } catch {
    // If lookup fails, fall through to normal routing
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
};
