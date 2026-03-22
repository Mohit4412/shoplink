type QueryValue = string | number | boolean | null | undefined;

function getEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : '';
}

export function getSupabaseUrl() {
  return getEnv('SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL');
}

export function getSupabaseAnonKey() {
  return getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');
}

export function getSupabaseServiceRoleKey() {
  return getEnv('SUPABASE_SERVICE_ROLE_KEY');
}

export function getSupabaseStorageBucket() {
  return getEnv('SUPABASE_STORAGE_BUCKET') || 'myshoplink-assets';
}

export function isSupabaseEnabled() {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey());
}

export function getSupabaseImageHost() {
  const url = getSupabaseUrl();
  if (!url) {
    return null;
  }

  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function encodePathSegment(value: string) {
  return value
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function buildUrl(pathname: string, query?: Record<string, QueryValue>) {
  const baseUrl = getSupabaseUrl();
  if (!baseUrl) {
    throw new Error('Supabase URL is not configured');
  }

  const url = new URL(pathname, baseUrl);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') {
        continue;
      }
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

function getAuthHeaders(extra?: HeadersInit) {
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!serviceRoleKey) {
    throw new Error('Supabase service role key is not configured');
  }

  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    ...extra,
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();
  if (!text) {
    return null as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

async function assertOk<T>(response: Response): Promise<T> {
  const payload = await parseResponse<unknown>(response);
  if (!response.ok) {
    const message = typeof payload === 'object' && payload && 'message' in payload
      ? String((payload as { message?: string }).message)
      : `Supabase request failed with ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export async function supabaseSelect<T>(table: string, query?: Record<string, QueryValue>, options?: { headers?: HeadersInit }) {
  const response = await fetch(buildUrl(`/rest/v1/${table}`, query), {
    headers: getAuthHeaders({
      Accept: 'application/json',
      ...options?.headers,
    }),
    cache: 'no-store',
  });

  return assertOk<T[]>(response);
}

export async function supabaseSelectOne<T>(table: string, query?: Record<string, QueryValue>, options?: { headers?: HeadersInit }) {
  const rows = await supabaseSelect<T>(table, query, {
    headers: {
      ...options?.headers,
      Accept: 'application/vnd.pgrst.object+json',
    },
  });

  return rows as T;
}

export async function supabaseInsert<T>(table: string, body: Record<string, unknown> | Array<Record<string, unknown>>, query?: Record<string, QueryValue>, options?: { upsert?: boolean; headers?: HeadersInit }) {
  const prefer = options?.upsert
    ? 'resolution=merge-duplicates,return=representation'
    : 'return=representation';
  const response = await fetch(buildUrl(`/rest/v1/${table}`, query), {
    method: 'POST',
    headers: getAuthHeaders({
      'Content-Type': 'application/json',
      Prefer: prefer,
      ...options?.headers,
    }),
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  return assertOk<T[]>(response);
}

export async function supabasePatch<T>(table: string, body: Record<string, unknown>, query?: Record<string, QueryValue>, options?: { headers?: HeadersInit }) {
  const response = await fetch(buildUrl(`/rest/v1/${table}`, query), {
    method: 'PATCH',
    headers: getAuthHeaders({
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...options?.headers,
    }),
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  return assertOk<T[]>(response);
}

export async function supabaseDelete(table: string, query?: Record<string, QueryValue>) {
  const response = await fetch(buildUrl(`/rest/v1/${table}`, query), {
    method: 'DELETE',
    headers: getAuthHeaders({
      Prefer: 'return=representation',
    }),
    cache: 'no-store',
  });

  return assertOk<unknown[]>(response);
}

export async function supabaseRpc<T>(fn: string, body?: Record<string, unknown>) {
  const response = await fetch(buildUrl(`/rest/v1/rpc/${fn}`), {
    method: 'POST',
    headers: getAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(body ?? {}),
    cache: 'no-store',
  });

  return assertOk<T>(response);
}

export async function supabaseCount(table: string, query?: Record<string, QueryValue>) {
  const response = await fetch(buildUrl(`/rest/v1/${table}`, {
    ...query,
    select: 'id',
  }), {
    method: 'HEAD',
    headers: getAuthHeaders({
      Prefer: 'count=exact',
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    await assertOk(response);
  }

  const contentRange = response.headers.get('content-range') ?? '';
  const total = contentRange.split('/').pop();
  return Number(total ?? 0) || 0;
}

export function getSupabasePublicUploadUrl(objectPath: string) {
  return `${getSupabaseUrl()}/storage/v1/object/public/${getSupabaseStorageBucket()}/${encodePathSegment(objectPath)}`;
}

export function getSupabaseObjectPathFromUrl(url: string) {
  const baseUrl = getSupabaseUrl();
  if (!baseUrl) {
    return null;
  }

  const prefix = `${baseUrl}/storage/v1/object/public/${getSupabaseStorageBucket()}/`;
  if (!url.startsWith(prefix)) {
    return null;
  }

  return decodeURIComponent(url.slice(prefix.length));
}

export async function uploadSupabaseObject(objectPath: string, buffer: Buffer, contentType: string) {
  const response = await fetch(
    buildUrl(`/storage/v1/object/${getSupabaseStorageBucket()}/${encodePathSegment(objectPath)}`),
    {
      method: 'POST',
      headers: getAuthHeaders({
        'Content-Type': contentType,
        'x-upsert': 'true',
      }),
      body: buffer,
      cache: 'no-store',
    }
  );

  await assertOk(response);
  return getSupabasePublicUploadUrl(objectPath);
}

export async function deleteSupabaseObject(objectPath: string) {
  const response = await fetch(
    buildUrl(`/storage/v1/object/${getSupabaseStorageBucket()}/${encodePathSegment(objectPath)}`),
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
      cache: 'no-store',
    }
  );

  if (response.status === 404) {
    return false;
  }

  await assertOk(response);
  return true;
}
