import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ROOT_HOSTNAME = 'myshoplink.site';

// App-shell routes — never accessible from a store subdomain or custom domain
const APP_ONLY_PREFIXES = ['/dashboard', '/analytics', '/products', '/settings', '/signup', '/support', '/forgot-password', '/reset-password'];

// Subdomains reserved for the app itself
const RESERVED_SUBDOMAINS = new Set(['www', 'app', 'api', 'mail', 'admin', 'status', 'help', 'docs']);

// Hosts that always serve the full app (homepage, dashboard, etc.)
const APP_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  ROOT_HOSTNAME,
  `www.${ROOT_HOSTNAME}`,
]);

function isVercelPreview(host: string) {
  return host.endsWith('.vercel.app');
}

export async function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').split(':')[0];
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Vercel preview deployments — pass through unchanged
  if (isVercelPreview(host)) {
    return NextResponse.next();
  }

  // Root domain + www + localhost — always serve the app as-is
  // myshoplink.site/ → marketing homepage
  // myshoplink.site/dashboard → dashboard
  if (APP_HOSTNAMES.has(host)) {
    return NextResponse.next();
  }

  // Store subdomain: username.myshoplink.site
  if (host.endsWith(`.${ROOT_HOSTNAME}`)) {
    const subdomain = host.slice(0, -(ROOT_HOSTNAME.length + 1));

    // Reserved or multi-level subdomains → treat as app
    if (!subdomain || subdomain.includes('.') || RESERVED_SUBDOMAINS.has(subdomain)) {
      return NextResponse.next();
    }

    // Block app-only routes from subdomains — redirect to root domain
    if (APP_ONLY_PREFIXES.some(p => pathname.startsWith(p))) {
      url.host = ROOT_HOSTNAME;
      url.pathname = pathname;
      return NextResponse.redirect(url);
    }

    // Rewrite to the store page: mohit.myshoplink.site/ → /mohit
    url.pathname = `/${subdomain}${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(url);
  }

  // Custom domain — look up which store owns it
  try {
    const lookupUrl = new URL(
      `/api/domains/lookup?domain=${encodeURIComponent(host)}`,
      req.url
    );
    // Cache for 60s to reduce DB hits on every request
    const res = await fetch(lookupUrl, { next: { revalidate: 60 } } as RequestInit);

    if (res.ok) {
      const { username } = await res.json();
      if (username) {
        if (APP_ONLY_PREFIXES.some(p => pathname.startsWith(p))) {
          url.host = ROOT_HOSTNAME;
          return NextResponse.redirect(url);
        }
        url.pathname = `/${username}${pathname === '/' ? '' : pathname}`;
        return NextResponse.rewrite(url);
      }
    }
  } catch {
    // fall through to normal routing
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
};
