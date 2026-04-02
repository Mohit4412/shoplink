import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseEnabled, supabaseSelect, supabasePatch } from '@/server/supabase';
import { db } from '@/server/db';
import { updateOrderById } from '@/server/dashboard-repository';

type RouteContext = { params: Promise<{ orderId: string }> };

// Allowed statuses a customer can self-report (no auth required)
const CUSTOMER_ALLOWED_STATUSES = new Set(['payment_pending_verification']);

async function findOrderUsername(orderId: string): Promise<string | null> {
  if (isSupabaseEnabled()) {
    const rows = await supabaseSelect<{ store_username: string }>('orders', {
      id: `eq.${orderId}`,
      select: 'store_username',
      limit: 1,
    });
    return rows[0]?.store_username ?? null;
  }
  if (!db) return null;
  const row = db.prepare('SELECT store_username FROM orders WHERE id = ?').get(orderId) as
    | { store_username: string }
    | undefined;
  return row?.store_username ?? null;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { orderId } = await params;
  const body = await req.json().catch(() => ({}));
  const { status } = body ?? {};

  if (!CUSTOMER_ALLOWED_STATUSES.has(status)) {
    return NextResponse.json({ error: 'Status not allowed' }, { status: 400 });
  }

  const username = await findOrderUsername(orderId);
  if (!username) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  await updateOrderById(username, orderId, { status });
  return NextResponse.json({ ok: true });
}
