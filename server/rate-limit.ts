/**
 * Lightweight in-memory rate limiter for Next.js API routes.
 * Uses a sliding window counter keyed by IP + route.
 * Works in Node.js runtime (not Edge). Resets on server restart.
 */

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

// Prune expired entries every 5 minutes to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, win] of store) {
    if (win.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSecs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // unix ms
}

export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const windowMs = opts.windowSecs * 1000;

  let win = store.get(key);
  if (!win || win.resetAt < now) {
    win = { count: 0, resetAt: now + windowMs };
    store.set(key, win);
  }

  win.count++;
  const allowed = win.count <= opts.limit;
  return {
    allowed,
    remaining: Math.max(0, opts.limit - win.count),
    resetAt: win.resetAt,
  };
}

/** Extract the real client IP from a Next.js request */
export function getClientIp(request: Request): string {
  const headers = (request as any).headers as Headers;
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}

/** Returns a 429 response with Retry-After header */
export function rateLimitedResponse(resetAt: number) {
  const retryAfterSecs = Math.ceil((resetAt - Date.now()) / 1000);
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again later.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSecs),
      },
    }
  );
}
