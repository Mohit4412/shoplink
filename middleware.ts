import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get('host') || '';
  const subdomain = host.split('.')[0];
  
  if (
    host.includes('localhost') ||
    host.includes('127.0.0.1') ||
    host.includes('vercel.app') ||
    subdomain === 'www' ||
    subdomain === 'myshoplink' ||
    host === 'myshoplink.site'
  ) {
    return NextResponse.next();
  }
  
  url.pathname = `/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
};
