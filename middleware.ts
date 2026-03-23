import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ROOT_HOSTNAME = 'myshoplink.site';

// Routes that belong to the app shell — never served from a store subdomain
const APP_ONLY_PREFIXES = ['/dashboard', '/analytics', '/products', '/settings', '/signup', '/support'];

const APP_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  ROOT_HOSTNAME,
]);

function isVercelPreview(host: string) {
  return host.endsWith('.vercel.app');
}

export async function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').split(':')[0];
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Vercel preview deployments — pass through
  if (isVercelPreview(host)) {
    return NextResponse.next();
  }

  // Root domain and localhost — always serve the app as-is
  // myshoplink.site/  → marketing homepage
  // myshoplink.site/dashboard → dashboard
  if (APP_HOSTNAMES.has(host)) {
    return NextResponse.next();
  }

  // Store subdomain: username.myshoplink.site
  if (host.endsWith(`.${ROOT_HOSTNAME}`)) {
    const subdomain = host.slice(0, -(ROOT_HOSTNAME.length + 1));

    if (subdomain && !subdomain.includes('.')) {
      // If someone tries to access an app-only route from a subdomain,
      // redirect them to the root domain instead
      if (APP_ONLY_PREFIXES.some(p => pathname.startsWith(p))) {
        url.host = ROOT_HOSTNAME;
        url.pathname = pathname;
        return NextResponse.redirect(url);
      }

      // Rewrite / and all store paths to /{subdomain}/...
      url.pathname = `/${subdomain}${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  // Custom domain — look up which store owns it
  try {
    const lookupUrl = new URL(
      `/api/domains/lookup?domain=${encodeURIComponent(host)}`,
      req.url
    );
    const res = await fetch(lookupUrl, { cache: 'no-store' });

    if (res.ok) {
      const { username } = await res.json();
      if (username) {
        // Same protection for custom domains
        if (APP_ONLY_PREFIXES.some(p => pathname.startsWith(p))) {
          url.host = ROOT_HOSTNAME;
          return NextResponse.redirect(url);
        }
        url.pathname = `/${username}${pathname === '/' ? '' : pathname}`;
        return NextResponse.rewrite(url);
      }
    }
  } catch {
    // fall through
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
};
