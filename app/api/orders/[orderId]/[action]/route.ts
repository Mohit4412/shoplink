import { NextRequest, NextResponse } from 'next/server';
import { verifyOrderToken } from '@/src/utils/orderToken';
import { updateOrderById } from '@/server/dashboard-repository';
import { isSupabaseEnabled, supabaseSelect } from '@/server/supabase';
import { db } from '@/server/db';

type RouteContext = { params: Promise<{ orderId: string; action: string }> };

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'https://myshoplink.site';

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
  const row = db.prepare('SELECT store_username FROM orders WHERE id = ?').get(orderId) as { store_username: string } | undefined;
  return row?.store_username ?? null;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { orderId, action } = await params;

  if (action !== 'confirm' && action !== 'decline') {
    return new NextResponse('Invalid action', { status: 400 });
  }

  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return new NextResponse('Missing token', { status: 401 });
  }

  const valid = await verifyOrderToken(orderId, action, token);
  if (!valid) {
    return new NextResponse('Invalid or expired token', { status: 403 });
  }

  const username = await findOrderUsername(orderId);
  if (!username) {
    return new NextResponse('Order not found', { status: 404 });
  }

  const newStatus = action === 'confirm' ? 'confirmed' : 'declined';
  await updateOrderById(username, orderId, { status: newStatus });

  // Redirect to a simple result page
  const resultUrl = new URL(`/order-action-result`, APP_URL);
  resultUrl.searchParams.set('status', newStatus);
  return NextResponse.redirect(resultUrl.toString());
}
