import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseEnabled, supabaseSelect } from '@/server/supabase';
import { db } from '@/server/db';

// Reserved slugs that must never be assigned as usernames
const RESERVED = new Set([
  'api', 'app', 'www', 'mail', 'admin', 'dashboard', 'settings',
  'signup', 'login', 'logout', 'support', 'help', 'about', 'pricing',
  'blog', 'docs', 'status', 'static', 'assets', 'uploads', 'health',
  'analytics', 'products', 'orders', 'billing', 'account', 'profile',
  'myshoplink', 'shoplink', 'store', 'stores',
]);

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get('username')?.trim().toLowerCase();

  if (!username) {
    return NextResponse.json({ available: false, reason: 'Username is required' });
  }

  if (username.length < 3) {
    return NextResponse.json({ available: false, reason: 'Must be at least 3 characters' });
  }

  if (username.length > 30) {
    return NextResponse.json({ available: false, reason: 'Must be 30 characters or fewer' });
  }

  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(username) && username.length >= 2) {
    return NextResponse.json({ available: false, reason: 'Only lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen.' });
  }

  if (RESERVED.has(username)) {
    return NextResponse.json({ available: false, reason: 'This username is reserved' });
  }

  try {
    if (isSupabaseEnabled()) {
      const rows = await supabaseSelect<{ username: string }>('users', {
        username: `eq.${username}`,
        select: 'username',
        limit: 1,
      });
      return NextResponse.json({ available: rows.length === 0 });
    }

    if (db) {
      const row = db.prepare('SELECT username FROM users WHERE username = ?').get(username);
      return NextResponse.json({ available: !row });
    }
  } catch {
    // fail open — don't block signup on a lookup error
  }

  return NextResponse.json({ available: true });
}
