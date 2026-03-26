import { db, requireDb } from '@/server/db';
import { deleteUploadedAssets } from '@/server/upload-storage';
import { isSupabaseEnabled, supabaseDelete, supabaseInsert, supabasePatch, supabaseSelect } from '@/server/supabase';
import { getDefaultAppState, normalizeProduct } from '@/src/lib/default-state';
import { Product, StoreSettings, UserProfile, PublicStorefrontData } from '@/src/types';

export interface MerchantStorefrontBundle {
  user: UserProfile;
  store: StoreSettings;
  products: Product[];
}

interface StoreRow {
  user_id: string;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  user_bio: string | null;
  whatsapp_number: string;
  avatar_url: string | null;
  plan: UserProfile['plan'];
  subscription_renewal_date: string;
  logo_url: string | null;
  store_name: string;
  tagline: string;
  store_bio: string | null;
  currency: string;
  theme: string | null;
  sections_json?: string | null | unknown; // retained in DB schema but no longer used
  trust_badges_json: string | null | unknown;
  banners_json: string | null | unknown;
  legal_json: string | null | unknown;
  custom_domain: string | null;
  custom_domain_status: StoreSettings['customDomainStatus'] | null;
}

interface ProductRow {
  store_username: string;
  product_id: string;
  image_url: string;
  images_json: string | null | unknown;
  name: string;
  price: number;
  description: string;
  status: Product['status'];
  created_at: string;
  category: string;
  stock: number;
  collection_name: string | null;
  highlights_json: string | null | unknown;
  reviews_json: string | null | unknown;
  is_demo: number | boolean | null;
}

function parseJson<T>(value: string | null | unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return value as T;
  if (typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function ensureStoreSchema() {
  if (!db) {
    return;
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS stores (
      username TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      email TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      user_bio TEXT,
      whatsapp_number TEXT NOT NULL,
      avatar_url TEXT,
      plan TEXT NOT NULL,
      subscription_renewal_date TEXT NOT NULL,
      logo_url TEXT,
      store_name TEXT NOT NULL,
      tagline TEXT NOT NULL,
      store_bio TEXT,
      currency TEXT NOT NULL,
      theme TEXT,
      sections_json TEXT,
      trust_badges_json TEXT,
      banners_json TEXT,
      legal_json TEXT,
      custom_domain TEXT,
      custom_domain_status TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      store_username TEXT NOT NULL,
      product_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      images_json TEXT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      category TEXT NOT NULL,
      stock INTEGER NOT NULL,
      collection_name TEXT,
      highlights_json TEXT,
      reviews_json TEXT,
      is_demo INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (store_username, product_id),
      FOREIGN KEY (store_username) REFERENCES stores (username) ON DELETE CASCADE
    );
  `);
  // Migrate existing DBs
  try { db.exec(`ALTER TABLE products ADD COLUMN is_demo INTEGER NOT NULL DEFAULT 0`); } catch { /* already exists */ }
  try { db.exec(`ALTER TABLE stores ADD COLUMN legal_json TEXT`); } catch { /* already exists */ }
}

function serializeStore(bundle: MerchantStorefrontBundle) {
  const { user, store } = bundle;
  return {
    user_id: user.id,
    username: user.username,
    email: user.email,
    first_name: user.firstName ?? null,
    last_name: user.lastName ?? null,
    user_bio: user.bio ?? null,
    whatsapp_number: user.whatsappNumber,
    avatar_url: user.avatarUrl ?? null,
    plan: user.plan,
    subscription_renewal_date: user.subscriptionRenewalDate,
    logo_url: store.logoUrl ?? null,
    store_name: store.name,
    tagline: store.tagline,
    store_bio: store.bio ?? null,
    currency: store.currency,
    theme: store.theme ?? null,
    trust_badges_json: store.trustBadges ? JSON.stringify(store.trustBadges) : null,
    banners_json: store.banners ? JSON.stringify(store.banners) : null,
    legal_json: store.legalPages ? JSON.stringify(store.legalPages) : null,
    custom_domain: store.customDomain ?? null,
    custom_domain_status: store.customDomainStatus ?? null,
  };
}

function serializeProduct(username: string, product: Product) {
  return {
    store_username: username,
    product_id: product.id,
    image_url: product.imageUrl,
    images_json: JSON.stringify(product.images ?? [product.imageUrl]),
    name: product.name,
    price: product.price,
    description: product.description,
    status: product.status,
    created_at: product.createdAt,
    category: product.category,
    stock: product.stock,
    collection_name: product.collection ?? null,
    highlights_json: JSON.stringify(product.highlights ?? []),
    reviews_json: JSON.stringify(product.reviews ?? []),
  };
}

function hydrateStore(row: StoreRow): { user: UserProfile; store: StoreSettings } {
  return {
    user: {
      id: row.user_id,
      email: row.email,
      firstName: row.first_name ?? undefined,
      lastName: row.last_name ?? undefined,
      username: row.username,
      bio: row.user_bio ?? '',
      whatsappNumber: row.whatsapp_number,
      avatarUrl: row.avatar_url ?? '',
      plan: row.plan,
      subscriptionRenewalDate: row.subscription_renewal_date,
    },
    store: {
      logoUrl: row.logo_url ?? '',
      name: row.store_name?.trim() ? row.store_name : row.username,
      tagline: row.tagline,
      bio: row.store_bio ?? '',
      trustBadges: parseJson(row.trust_badges_json, []),
      currency: row.currency,
      theme: row.theme ?? undefined,
      banners: parseJson(row.banners_json, undefined),
      legalPages: parseJson(row.legal_json, undefined),
      customDomain: row.custom_domain ?? undefined,
      customDomainStatus: row.custom_domain_status ?? undefined,
    },
  };
}

function hydrateProduct(row: ProductRow): Product {
  return normalizeProduct({
    id: row.product_id,
    imageUrl: row.image_url,
    images: parseJson(row.images_json, [row.image_url]),
    name: row.name,
    price: row.price,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    category: row.category,
    stock: row.stock,
    collection: row.collection_name ?? undefined,
    highlights: parseJson(row.highlights_json, []),
    reviews: parseJson(row.reviews_json, []),
  });
}

let upsertStoreStmt: any;
let replaceProductStmt: any;
let deleteStoreProductsStmt: any;
let deleteProductStmt: any;
let selectStoreStmt: any;
let selectStoreProductsStmt: any;
let selectStoreProductStmt: any;
let countStoresStmt: any;
let replaceBundleTxn: any;


if (db) {
  ensureStoreSchema();

  upsertStoreStmt = db.prepare(`
  INSERT INTO stores (
    user_id, username, email, first_name, last_name, user_bio, whatsapp_number, avatar_url, plan,
    subscription_renewal_date, logo_url, store_name, tagline, store_bio, currency, theme,
    trust_badges_json, banners_json, legal_json, custom_domain, custom_domain_status
  ) VALUES (
    @user_id, @username, @email, @first_name, @last_name, @user_bio, @whatsapp_number, @avatar_url, @plan,
    @subscription_renewal_date, @logo_url, @store_name, @tagline, @store_bio, @currency, @theme,
    @trust_badges_json, @banners_json, @legal_json, @custom_domain, @custom_domain_status
  )
  ON CONFLICT(username) DO UPDATE SET
    user_id = excluded.user_id,
    email = excluded.email,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    user_bio = excluded.user_bio,
    whatsapp_number = excluded.whatsapp_number,
    avatar_url = excluded.avatar_url,
    plan = excluded.plan,
    subscription_renewal_date = excluded.subscription_renewal_date,
    logo_url = excluded.logo_url,
    store_name = excluded.store_name,
    tagline = excluded.tagline,
    store_bio = excluded.store_bio,
    currency = excluded.currency,
    theme = excluded.theme,
    trust_badges_json = excluded.trust_badges_json,
    banners_json = excluded.banners_json,
    legal_json = excluded.legal_json,
    custom_domain = excluded.custom_domain,
    custom_domain_status = excluded.custom_domain_status
`);

  replaceProductStmt = db.prepare(`
  INSERT INTO products (
    store_username, product_id, image_url, images_json, name, price, description, status, created_at,
    category, stock, collection_name, highlights_json, reviews_json
  ) VALUES (
    @store_username, @product_id, @image_url, @images_json, @name, @price, @description, @status, @created_at,
    @category, @stock, @collection_name, @highlights_json, @reviews_json
  )
  ON CONFLICT(store_username, product_id) DO UPDATE SET
    image_url = excluded.image_url,
    images_json = excluded.images_json,
    name = excluded.name,
    price = excluded.price,
    description = excluded.description,
    status = excluded.status,
    created_at = excluded.created_at,
    category = excluded.category,
    stock = excluded.stock,
    collection_name = excluded.collection_name,
    highlights_json = excluded.highlights_json,
    reviews_json = excluded.reviews_json
`);

  deleteStoreProductsStmt = db.prepare('DELETE FROM products WHERE store_username = ?');
  deleteProductStmt = db.prepare('DELETE FROM products WHERE store_username = ? AND product_id = ?');
  selectStoreStmt = db.prepare('SELECT * FROM stores WHERE username = ?');
  selectStoreProductsStmt = db.prepare('SELECT * FROM products WHERE store_username = ? ORDER BY datetime(created_at) DESC, product_id ASC');
  selectStoreProductStmt = db.prepare('SELECT * FROM products WHERE store_username = ? AND product_id = ?');
  countStoresStmt = db.prepare('SELECT COUNT(*) as count FROM stores');
  // deleteDemoProductsStmt removed — demo data no longer seeded

  replaceBundleTxn = db.transaction((bundle: MerchantStorefrontBundle) => {
    upsertStoreStmt.run(serializeStore(bundle));
    deleteStoreProductsStmt.run(bundle.user.username);
    for (const product of bundle.products) {
      replaceProductStmt.run(serializeProduct(bundle.user.username, normalizeProduct(product)));
    }
  });

  if ((countStoresStmt.get() as { count: number }).count === 0) {
    const initialState = getDefaultAppState();
    replaceBundleTxn({
      user: initialState.user!,
      store: initialState.store,
      products: initialState.products,
    });
  }
}

// deleteDemoProducts removed — demo data is no longer seeded for new users

async function getMerchantBundleByUsernameSupabase(username: string): Promise<MerchantStorefrontBundle | null> {
  const [storeRow] = await supabaseSelect<StoreRow>('stores', {
    username: `eq.${username}`,
    select: '*',
    limit: 1,
  });
  if (!storeRow) {
    return null;
  }

  const rows = await supabaseSelect<ProductRow>('products', {
    store_username: `eq.${username}`,
    select: '*',
    order: 'created_at.desc,product_id.asc',
  });
  const hydrated = hydrateStore(storeRow);

  return {
    user: hydrated.user,
    store: hydrated.store,
    products: rows.map(hydrateProduct),
  };
}

export async function getMerchantBundleByUsername(username: string): Promise<MerchantStorefrontBundle | null> {
  if (isSupabaseEnabled()) {
    return getMerchantBundleByUsernameSupabase(username);
  }

  requireDb();
  const storeRow = selectStoreStmt.get(username) as StoreRow | undefined;
  if (!storeRow) {
    return null;
  }

  const rows = selectStoreProductsStmt.all(username) as ProductRow[];
  const hydrated = hydrateStore(storeRow);

  return {
    user: hydrated.user,
    store: hydrated.store,
    products: rows.map(hydrateProduct),
  };
}

export async function getPublicStorefrontByUsername(username: string): Promise<PublicStorefrontData | null> {
  const bundle = await getMerchantBundleByUsername(username);
  if (!bundle) {
    return null;
  }

  return {
    user: {
      username: bundle.user.username,
      whatsappNumber: bundle.user.whatsappNumber,
      plan: bundle.user.plan,
    },
    store: bundle.store,
    products: bundle.products,
  };
}

export async function getPublicProductByStore(username: string, productId: string) {
  const bundle = await getPublicStorefrontByUsername(username);
  if (!bundle) {
    return null;
  }

  const product = bundle.products.find((item) => item.id === productId);
  if (!product) {
    return null;
  }

  return { ...bundle, product };
}

export async function replaceMerchantBundle(bundle: MerchantStorefrontBundle) {
  if (isSupabaseEnabled()) {
    const normalizedProducts = bundle.products.map(normalizeProduct);
    const storeSerialized = serializeStore(bundle);
    try {
      await supabaseInsert<StoreRow>('stores', storeSerialized, { on_conflict: 'username' }, { upsert: true });
    } catch {
      // Retry without legal_json in case column doesn't exist yet in Supabase
      const { legal_json: _, ...withoutLegal } = storeSerialized;
      await supabaseInsert<StoreRow>('stores', withoutLegal, { on_conflict: 'username' }, { upsert: true });
    }
    await supabaseDelete('products', { store_username: `eq.${bundle.user.username}` });
    if (normalizedProducts.length > 0) {
      const serialized = normalizedProducts.map((product) => serializeProduct(bundle.user.username, product));
      await supabaseInsert<ProductRow>('products', serialized, undefined, {});
    }
    return getMerchantBundleByUsername(bundle.user.username);
  }

  requireDb();
  replaceBundleTxn({
    ...bundle,
    products: bundle.products.map(normalizeProduct),
  });
  return getMerchantBundleByUsername(bundle.user.username);
}

export async function updateStoreDetails(username: string, storePatch: Partial<StoreSettings>) {
  const current = await getMerchantBundleByUsername(username);
  if (!current) {
    return null;
  }

  return replaceMerchantBundle({
    ...current,
    store: {
      ...current.store,
      ...storePatch,
    },
  });
}

export async function createProduct(username: string, product: Product) {
  const current = await getMerchantBundleByUsername(username);
  if (!current) {
    return null;
  }

  if (isSupabaseEnabled()) {
    const serialized = serializeProduct(username, normalizeProduct(product));
    await supabaseInsert<ProductRow>('products', serialized);
    return getMerchantBundleByUsername(username);
  }

  requireDb();
  replaceProductStmt.run(serializeProduct(username, normalizeProduct(product)));
  return getMerchantBundleByUsername(username);
}

export async function updateProductById(username: string, productId: string, updates: Partial<Product>) {
  const current = await getMerchantBundleByUsername(username);
  if (!current) {
    return null;
  }

  const existingRow = isSupabaseEnabled()
    ? (await supabaseSelect<ProductRow>('products', {
        store_username: `eq.${username}`,
        product_id: `eq.${productId}`,
        select: '*',
        limit: 1,
      }))[0]
    : (selectStoreProductStmt.get(username, productId) as ProductRow | undefined);
  if (!existingRow) {
    return null;
  }

  const nextProduct = normalizeProduct({
    ...hydrateProduct(existingRow),
    ...updates,
    id: productId,
  });

  if (isSupabaseEnabled()) {
    const serialized = serializeProduct(username, nextProduct);
    await supabasePatch<ProductRow>(
      'products',
      serialized,
      { store_username: `eq.${username}`, product_id: `eq.${productId}` }
    );
  } else {
    requireDb();
    replaceProductStmt.run(serializeProduct(username, nextProduct));
  }
  const previousImages = new Set(parseJson(existingRow.images_json, [existingRow.image_url]));
  const nextImages = new Set(nextProduct.images ?? [nextProduct.imageUrl]);
  const removedImages = [...previousImages].filter((image) => !nextImages.has(image));
  if (removedImages.length > 0) {
    void deleteUploadedAssets(username, removedImages);
  }
  return getMerchantBundleByUsername(username);
}

export async function deleteProductById(username: string, productId: string) {
  const current = await getMerchantBundleByUsername(username);
  if (!current) {
    return null;
  }

  const existingRow = isSupabaseEnabled()
    ? (await supabaseSelect<ProductRow>('products', {
        store_username: `eq.${username}`,
        product_id: `eq.${productId}`,
        select: '*',
        limit: 1,
      }))[0]
    : (selectStoreProductStmt.get(username, productId) as ProductRow | undefined);

  if (isSupabaseEnabled()) {
    await supabaseDelete('products', {
      store_username: `eq.${username}`,
      product_id: `eq.${productId}`,
    });
  } else {
    requireDb();
    deleteProductStmt.run(username, productId);
  }
  if (existingRow) {
    const images = parseJson(existingRow.images_json, [existingRow.image_url]);
    void deleteUploadedAssets(username, images);
  }
  return getMerchantBundleByUsername(username);
}
