function getRuntimeOrigin() {
  if (typeof window !== 'undefined') {
    const { origin, hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return origin;
    }
  }

  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, '');
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  return 'https://myshoplink.site';
}

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/\.$/, '');
}

function getConfiguredAppHostname(): string | null {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configuredOrigin) return null;

  try {
    return normalizeHostname(new URL(configuredOrigin).hostname);
  } catch {
    return null;
  }
}

export function isStoreSubdomainHost(hostname: string): boolean {
  const normalizedHost = normalizeHostname(hostname);

  if (
    normalizedHost === 'localhost' ||
    normalizedHost === '127.0.0.1' ||
    normalizedHost.endsWith('.vercel.app')
  ) {
    return false;
  }

  const configuredHost = getConfiguredAppHostname();
  if (configuredHost) {
    if (normalizedHost === configuredHost) return false;
    if (normalizedHost === `www.${configuredHost}`) return false;
    if (configuredHost.startsWith('www.') && normalizedHost === configuredHost.slice(4)) return false;
  }

  const parts = normalizedHost.split('.');
  return parts.length >= 3 && parts[0] !== 'www';
}

export function getStoreSubdomain(hostname: string): string | null {
  if (!isStoreSubdomainHost(hostname)) return null;
  return normalizeHostname(hostname).split('.')[0] ?? null;
}

export function getStoreUrl(username: string): string {
  const origin = getRuntimeOrigin();
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return `${origin}/${username}`;
  }
  return `https://${username}.myshoplink.site`;
}

export function getProductUrl(username: string, productId: string): string {
  const origin = getRuntimeOrigin();
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return `${origin}/${username}/product/${productId}`;
  }
  return `https://${username}.myshoplink.site/product/${productId}`;
}
