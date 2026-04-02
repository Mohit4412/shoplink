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
