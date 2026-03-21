import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getRequestSessionUser } from '@/server/auth';
import { createOrder, getOrdersByStore } from '@/server/dashboard-repository';

export async function GET(request: NextRequest) {
  const user = await getRequestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ orders: await getOrdersByStore(user.username) });
}

export async function POST(request: NextRequest) {
  const user = await getRequestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const order = body?.order;
  if (!order?.productId || !order?.date) {
    return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 });
  }

  const orders = await createOrder(user.username, {
    id: `o_${randomUUID()}`,
    productId: order.productId,
    quantity: Number(order.quantity ?? 1),
    revenue: Number(order.revenue ?? 0),
    date: order.date,
    notes: order.notes ?? '',
    status: order.status ?? 'confirmed',
  });

  return NextResponse.json({ orders });
}
