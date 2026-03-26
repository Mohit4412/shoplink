import { NextRequest, NextResponse } from 'next/server';
import { getRequestSessionUser } from '@/server/auth';
import { getMerchantBundleByUsername, replaceMerchantBundle, updateStoreDetails } from '@/server/store-repository';

type RouteContext = {
  params: Promise<{ username: string }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
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
  } catch (err) {
    console.error('[GET /api/stores]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
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
  } catch (err) {
    console.error('[PUT /api/stores]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { username } = await params;
    const sessionUser = await getRequestSessionUser(request);
    if (!sessionUser || sessionUser.username !== username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await request.json();
    const storePatch = body?.store ?? {};

    const bundle = await updateStoreDetails(username, storePatch);
    if (!bundle) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }
    return NextResponse.json(bundle);
  } catch (err) {
    console.error('[PATCH /api/stores]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
