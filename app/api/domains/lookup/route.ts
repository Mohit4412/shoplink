import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseEnabled, supabaseSelect } from '@/server/supabase';
import { db } from '@/server/db';

// Lightweight endpoint called by middleware to resolve custom domain → username.
// Must be fast — it runs on every request for custom domains.
export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain');
  if (!domain) {
    return NextResponse.json({ username: null }, { status: 400 });
  }

  try {
    if (isSupabaseEnabled()) {
      const rows = await supabaseSelect<{ username: string; custom_domain_status: string }>('stores', {
        custom_domain: `eq.${domain}`,
        custom_domain_status: `eq.active`,
        select: 'username,custom_domain_status',
        limit: 1,
      });
      const username = rows[0]?.username ?? null;
      return NextResponse.json({ username });
    }

    // SQLite fallback
    if (db) {
      const row = db
        .prepare('SELECT username FROM stores WHERE custom_domain = ? AND custom_domain_status = ?')
        .get(domain, 'active') as { username: string } | undefined;
      return NextResponse.json({ username: row?.username ?? null });
    }
  } catch {
    // fail open — don't break the site
  }

  return NextResponse.json({ username: null });
}
