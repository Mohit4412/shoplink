/**
 * Generates a URL-friendly slug for a product link.
 *
 * Format: {username}--{kebab-product-name}-{shortId}
 * Example: mystore--red-silk-saree-abc123
 *
 * The productId suffix guarantees uniqueness even if two products
 * share the same name. The page at /p/[slug] parses on "--" to
 * extract username, then uses the full remainder as the productId
 * lookup key — so we keep the existing {username}--{productId} format
 * and just prepend a human-readable name prefix to the productId portion.
 *
 * Since our existing route already uses {username}--{productId} and
 * productId is the source of truth, we keep the slug as:
 *   {username}--{productId}
 * and expose a display-friendly version separately.
 */

/** Converts a product name to a kebab-case URL segment */
export function toKebab(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // strip special chars
    .replace(/\s+/g, '-')            // spaces → hyphens
    .replace(/-+/g, '-')             // collapse multiple hyphens
    .slice(0, 48);                   // cap length
}

/**
 * Returns the canonical slug used in /p/[slug].
 * Slug = {username}--{productId}
 * This is what gets stored in the URL and parsed by the page.
 */
export function getProductSlug(username: string, productId: string): string {
  return `${username}--${productId}`;
}

/**
 * Returns the full shareable product URL.
 * Uses the current origin in the browser, or NEXT_PUBLIC_APP_URL on the server.
 */
export function getProductShareUrl(username: string, productId: string): string {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL ?? 'https://myshop.link');

  return `${origin}/p/${getProductSlug(username, productId)}`;
}
