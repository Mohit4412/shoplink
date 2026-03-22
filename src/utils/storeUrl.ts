export function getStoreUrl(username: string): string {
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:3000/${username}`;
  }
  return `https://${username}.myshoplink.site`;
}

export function getProductUrl(username: string, productId: string): string {
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:3000/${username}/product/${productId}`;
  }
  return `https://${username}.myshoplink.site/product/${productId}`;
}
