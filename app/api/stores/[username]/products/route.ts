import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getRequestSessionUser } from '@/server/auth';
import { createProduct } from '@/server/store-repository';

type RouteContext = {
  params: Promise<{ username: string }>;
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { username } = await params;
  const sessionUser = await getRequestSessionUser(request);
  if (!sessionUser || sessionUser.username !== username) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await request.json();

  if (!body?.product) {
    return NextResponse.json({ error: 'Missing product payload' }, { status: 400 });
  }

  const bundle = await createProduct(username, {
    ...body.product,
    id: body.product.id ?? `p_${randomUUID()}`,
    createdAt: body.product.createdAt ?? new Date().toISOString(),
  });
  if (!bundle) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  return NextResponse.json(bundle);
}
