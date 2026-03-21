import { NextRequest, NextResponse } from 'next/server';
import { getRequestSessionUser } from '@/server/auth';
import { deleteProductById, updateProductById } from '@/server/store-repository';

type RouteContext = {
  params: Promise<{ username: string; productId: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { username, productId } = await params;
  const sessionUser = await getRequestSessionUser(request);
  if (!sessionUser || sessionUser.username !== username) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await request.json();
  const bundle = await updateProductById(username, productId, body?.product ?? {});

  if (!bundle) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(bundle);
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const sessionUser = await getRequestSessionUser(_request);
  const { username, productId } = await params;
  if (!sessionUser || sessionUser.username !== username) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const bundle = await deleteProductById(username, productId);

  if (!bundle) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(bundle);
}
