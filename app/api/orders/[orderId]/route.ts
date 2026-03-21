import { NextRequest, NextResponse } from 'next/server';
import { getRequestSessionUser } from '@/server/auth';
import { deleteOrderById, updateOrderById } from '@/server/dashboard-repository';

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const user = await getRequestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orderId } = await params;
  const body = await request.json();
  const orders = await updateOrderById(user.username, orderId, body?.order ?? {});
  if (!orders) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ orders });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const user = await getRequestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orderId } = await params;
  const orders = await deleteOrderById(user.username, orderId);
  return NextResponse.json({ orders });
}
