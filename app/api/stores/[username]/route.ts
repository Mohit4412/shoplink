import { NextRequest, NextResponse } from 'next/server';
import { getRequestSessionUser } from '@/server/auth';
import { getMerchantBundleByUsername, replaceMerchantBundle, updateStoreDetails } from '@/server/store-repository';

type RouteContext = {
  params: Promise<{ username: string }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { username } = await params;
  const sessionUser = await getRequestSessionUser(request);
  if (!sessionUser || sessionUser.username !== username) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const bundle = await getMerchantBundleByUsername(username);

  if (!bundle) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  return NextResponse.json(bundle);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { username } = await params;
  const sessionUser = await getRequestSessionUser(request);
  if (!sessionUser || sessionUser.username !== username) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await request.json();

  if (!body?.user || !body?.store || !Array.isArray(body?.products)) {
    return NextResponse.json({ error: 'Invalid store payload' }, { status: 400 });
  }

  const bundle = await replaceMerchantBundle({
    user: { ...body.user, username },
    store: body.store,
    products: body.products,
  });

  return NextResponse.json(bundle);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { username } = await params;
  const sessionUser = await getRequestSessionUser(request);
  if (!sessionUser || sessionUser.username !== username) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await request.json();
  const bundle = await updateStoreDetails(username, body?.store ?? {});

  if (!bundle) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  return NextResponse.json(bundle);
}
