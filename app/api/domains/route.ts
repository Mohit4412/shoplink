import { NextRequest, NextResponse } from 'next/server';
import { getRequestSessionUser } from '@/server/auth';
import { updateStoreDetails, getMerchantBundleByUsername } from '@/server/store-repository';
import { isSupabaseEnabled, supabaseSelect } from '@/server/supabase';

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID; // optional

function vercelHeaders() {
  return {
    Authorization: `Bearer ${VERCEL_API_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

function vercelProjectUrl(path: string) {
  const base = `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains${path}`;
  return VERCEL_TEAM_ID ? `${base}${path.includes('?') ? '&' : '?'}teamId=${VERCEL_TEAM_ID}` : base;
}

// POST /api/domains — register a custom domain
export async function POST(request: NextRequest) {
  const sessionUser = await getRequestSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (sessionUser.plan !== 'Pro') {
    return NextResponse.json({ error: 'Custom domains require a Pro plan' }, { status: 403 });
  }

  const { domain } = await request.json();
  if (!domain || typeof domain !== 'string') {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
  }

  const normalized = domain.trim().toLowerCase();
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
  if (!domainRegex.test(normalized)) {
    return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
  }

  // Check domain isn't already taken by another store
  if (isSupabaseEnabled()) {
    const rows = await supabaseSelect<{ username: string }>('stores', {
      custom_domain: `eq.${normalized}`,
      select: 'username',
      limit: 1,
    });
    if (rows.length > 0 && rows[0].username !== sessionUser.username) {
      return NextResponse.json({ error: 'Domain already in use' }, { status: 409 });
    }
  }

  // Register domain with Vercel
  if (VERCEL_API_TOKEN && VERCEL_PROJECT_ID) {
    const res = await fetch(vercelProjectUrl(''), {
      method: 'POST',
      headers: vercelHeaders(),
      body: JSON.stringify({ name: normalized }),
    });

    if (!res.ok && res.status !== 409) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err?.error?.message || 'Failed to register domain with Vercel' },
        { status: 502 }
      );
    }
  }

  // Save to store
  await updateStoreDetails(sessionUser.username, {
    customDomain: normalized,
    customDomainStatus: 'pending',
  });

  return NextResponse.json({ domain: normalized, status: 'pending' });
}

// GET /api/domains/verify?domain=shop.example.com — check DNS + Vercel verification
export async function GET(request: NextRequest) {
  const sessionUser = await getRequestSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const domain = request.nextUrl.searchParams.get('domain');
  if (!domain) {
    return NextResponse.json({ error: 'Domain param required' }, { status: 400 });
  }

  if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
    // No Vercel config — just mark active for local/demo use
    await updateStoreDetails(sessionUser.username, { customDomainStatus: 'active' });
    return NextResponse.json({ verified: true, status: 'active' });
  }

  const res = await fetch(vercelProjectUrl(`/${domain}/verify`), {
    method: 'POST',
    headers: vercelHeaders(),
  });

  const data = await res.json().catch(() => ({}));
  const verified = data?.verified === true;
  const status = verified ? 'active' : 'failed';

  await updateStoreDetails(sessionUser.username, { customDomainStatus: status });

  return NextResponse.json({ verified, status, detail: data });
}

// DELETE /api/domains — remove custom domain
export async function DELETE(request: NextRequest) {
  const sessionUser = await getRequestSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bundle = await getMerchantBundleByUsername(sessionUser.username);
  const domain = bundle?.store.customDomain;

  if (domain && VERCEL_API_TOKEN && VERCEL_PROJECT_ID) {
    await fetch(vercelProjectUrl(`/${domain}`), {
      method: 'DELETE',
      headers: vercelHeaders(),
    });
  }

  await updateStoreDetails(sessionUser.username, {
    customDomain: '',
    customDomainStatus: undefined,
  });

  return NextResponse.json({ success: true });
}
