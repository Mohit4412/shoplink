import { randomBytes, pbkdf2Sync, timingSafeEqual } from 'crypto';
import { cp, rm, stat } from 'fs/promises';
import { cookies } from 'next/headers';
import path from 'path';
import type { NextRequest, NextResponse } from 'next/server';
import { db, requireDb } from '@/server/db';
import { ensureDashboardSchema } from '@/server/dashboard-repository';
import { ensureStoreSchema } from '@/server/store-repository';
import { isSupabaseEnabled, supabaseDelete, supabaseInsert, supabasePatch, supabaseSelect } from '@/server/supabase';
import { getDefaultAppState } from '@/src/lib/default-state';
import { UserProfile } from '@/src/types';

const SESSION_COOKIE = 'myshoplink_session';
const SESSION_TTL_DAYS = 30;
const HASH_ITERATIONS = 120000;
const HASH_KEYLEN = 64;
const HASH_DIGEST = 'sha512';

interface UserRow {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  whatsapp_number: string;
  avatar_url: string | null;
  plan: UserProfile['plan'];
  subscription_renewal_date: string;
}

interface StoreAssetRow {
  logo_url: string | null;
  banners_json: string | null;
}

function ensureAuthSchema() {
  if (!db) {
    return;
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      bio TEXT,
      whatsapp_number TEXT NOT NULL,
      avatar_url TEXT,
      plan TEXT NOT NULL,
      subscription_renewal_date TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);
}

function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
  const derived = pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_DIGEST).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [salt, expectedHash] = storedHash.split(':');
  if (!salt || !expectedHash) {
    return false;
  }

  const actualHash = pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_DIGEST).toString('hex');
  const expectedBuffer = Buffer.from(expectedHash, 'hex');
  const actualBuffer = Buffer.from(actualHash, 'hex');

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

function toUserProfile(row: UserRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name ?? undefined,
    lastName: row.last_name ?? undefined,
    username: row.username,
    bio: row.bio ?? '',
    whatsappNumber: row.whatsapp_number,
    avatarUrl: row.avatar_url ?? '',
    plan: row.plan,
    subscriptionRenewalDate: row.subscription_renewal_date,
  };
}

let insertUserStmt: any;
let updateUserStmt: any;
let findUserByEmailStmt: any;
let findUserByUsernameStmt: any;
let findUserByIdStmt: any;
let countUsersStmt: any;
let insertSessionStmt: any;
let findSessionStmt: any;
let deleteSessionStmt: any;
let deleteExpiredSessionsStmt: any;
let renameUserStmt: any;
let selectStoreAssetsStmt: any;
let insertRenamedStoreStmt: any;
let deleteStoreStmt: any;
let renameProductsOwnerStmt: any;
let renameOrdersOwnerStmt: any;
let renameAnalyticsOwnerStmt: any;
let rewriteProductImageUrlsStmt: any;

if (db) {
  ensureAuthSchema();
  ensureStoreSchema();
  ensureDashboardSchema();

  insertUserStmt = db.prepare(`
  INSERT INTO users (
    id, email, username, password_hash, first_name, last_name, bio, whatsapp_number,
    avatar_url, plan, subscription_renewal_date, created_at
  ) VALUES (
    @id, @email, @username, @password_hash, @first_name, @last_name, @bio, @whatsapp_number,
    @avatar_url, @plan, @subscription_renewal_date, @created_at
  )
`);

  updateUserStmt = db.prepare(`
  UPDATE users
  SET
    first_name = @first_name,
    last_name = @last_name,
    bio = @bio,
    whatsapp_number = @whatsapp_number,
    avatar_url = @avatar_url,
    plan = @plan,
    subscription_renewal_date = @subscription_renewal_date
  WHERE id = @id
`);

  findUserByEmailStmt = db.prepare('SELECT * FROM users WHERE email = ?');
  findUserByUsernameStmt = db.prepare('SELECT * FROM users WHERE username = ?');
  findUserByIdStmt = db.prepare('SELECT * FROM users WHERE id = ?');
  countUsersStmt = db.prepare('SELECT COUNT(*) as count FROM users');
  insertSessionStmt = db.prepare('INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)');
  findSessionStmt = db.prepare(`
  SELECT users.*
  FROM sessions
  INNER JOIN users ON users.id = sessions.user_id
  WHERE sessions.token = ? AND datetime(sessions.expires_at) > datetime('now')
`);
  deleteSessionStmt = db.prepare('DELETE FROM sessions WHERE token = ?');
  deleteExpiredSessionsStmt = db.prepare(`DELETE FROM sessions WHERE datetime(expires_at) <= datetime('now')`);
  renameUserStmt = db.prepare(`UPDATE users SET username = @next_username WHERE id = @id`);
  selectStoreAssetsStmt = db.prepare(`SELECT logo_url, banners_json FROM stores WHERE username = ?`);
  insertRenamedStoreStmt = db.prepare(`
  INSERT INTO stores (
    user_id, username, email, first_name, last_name, user_bio, whatsapp_number, avatar_url, plan,
    subscription_renewal_date, logo_url, store_name, tagline, store_bio, currency, theme,
    sections_json, trust_badges_json, banners_json, custom_domain, custom_domain_status
  )
  SELECT
    user_id, @next_username, email, @first_name, @last_name, @bio, @whatsapp_number, @avatar_url, plan,
    subscription_renewal_date, @logo_url, store_name, tagline, store_bio, currency, theme,
    sections_json, trust_badges_json, @banners_json, custom_domain, custom_domain_status
  FROM stores
  WHERE username = @previous_username
`);
  deleteStoreStmt = db.prepare(`DELETE FROM stores WHERE username = ?`);
  renameProductsOwnerStmt = db.prepare(`UPDATE products SET store_username = ? WHERE store_username = ?`);
  renameOrdersOwnerStmt = db.prepare(`UPDATE orders SET store_username = ? WHERE store_username = ?`);
  renameAnalyticsOwnerStmt = db.prepare(`UPDATE analytics_daily SET store_username = ? WHERE store_username = ?`);
  rewriteProductImageUrlsStmt = db.prepare(`
  UPDATE products
  SET
    image_url = @image_url,
    images_json = @images_json
  WHERE store_username = @store_username AND product_id = @product_id
`);

  deleteExpiredSessionsStmt.run();

  if ((countUsersStmt.get() as { count: number }).count === 0) {
    const defaultUser = getDefaultAppState().user!;
    insertUserStmt.run({
      id: defaultUser.id,
      email: defaultUser.email,
      username: defaultUser.username,
      password_hash: hashPassword('password123'),
      first_name: defaultUser.firstName ?? null,
      last_name: defaultUser.lastName ?? null,
      bio: defaultUser.bio ?? null,
      whatsapp_number: defaultUser.whatsappNumber,
      avatar_url: defaultUser.avatarUrl ?? null,
      plan: defaultUser.plan,
      subscription_renewal_date: defaultUser.subscriptionRenewalDate,
      created_at: new Date().toISOString(),
    });
  }
}

// ─── Password reset tokens ────────────────────────────────────────────────────

const RESET_TOKEN_TTL_MINUTES = 60;

let insertResetTokenStmt: any;
let findResetTokenStmt: any;
let deleteResetTokenStmt: any;
let deleteExpiredResetTokensStmt: any;
let updatePasswordStmt: any;

if (db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  insertResetTokenStmt = db.prepare(
    'INSERT INTO password_reset_tokens (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)'
  );
  findResetTokenStmt = db.prepare(`
    SELECT password_reset_tokens.*, users.email, users.id as uid
    FROM password_reset_tokens
    INNER JOIN users ON users.id = password_reset_tokens.user_id
    WHERE password_reset_tokens.token = ?
      AND datetime(password_reset_tokens.expires_at) > datetime('now')
  `);
  deleteResetTokenStmt = db.prepare('DELETE FROM password_reset_tokens WHERE token = ?');
  deleteExpiredResetTokensStmt = db.prepare(
    `DELETE FROM password_reset_tokens WHERE datetime(expires_at) <= datetime('now')`
  );
  updatePasswordStmt = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?');

  deleteExpiredResetTokensStmt.run();
}

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const row = isSupabaseEnabled()
    ? (await supabaseSelect<UserRow>('users', { email: `eq.${email}`, select: 'id,email', limit: 1 }))[0]
    : (findUserByEmailStmt?.get(email) as UserRow | undefined);

  if (!row) return null;

  const token = randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  if (isSupabaseEnabled()) {
    // Delete any existing tokens for this user first
    await supabaseDelete('password_reset_tokens', { user_id: `eq.${row.id}` });
    await supabaseInsert('password_reset_tokens', {
      token,
      user_id: row.id,
      expires_at: expiresAt.toISOString(),
      created_at: now.toISOString(),
    });
  } else {
    db!.prepare('DELETE FROM password_reset_tokens WHERE user_id = ?').run(row.id);
    insertResetTokenStmt.run(token, row.id, expiresAt.toISOString(), now.toISOString());
  }

  return token;
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
  if (isSupabaseEnabled()) {
    const rows = await supabaseSelect<{ token: string; user_id: string; expires_at: string }>(
      'password_reset_tokens',
      { token: `eq.${token}`, select: 'token,user_id,expires_at', limit: 1 }
    );
    const row = rows[0];
    if (!row) return false;
    if (new Date(row.expires_at) < new Date()) return false;

    await supabasePatch<UserRow>('users', { password_hash: hashPassword(newPassword) }, { id: `eq.${row.user_id}` });
    await supabaseDelete('password_reset_tokens', { token: `eq.${token}` });
    return true;
  }

  const row = findResetTokenStmt?.get(token) as { user_id: string } | undefined;
  if (!row) return false;

  updatePasswordStmt.run(hashPassword(newPassword), row.user_id);
  deleteResetTokenStmt.run(token);
  return true;
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export async function createUser(input: {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  whatsappNumber: string;
}) {
  if (isSupabaseEnabled()) {
    const [existingEmail, existingUsername] = await Promise.all([
      supabaseSelect<UserRow>('users', { email: `eq.${input.email}`, select: '*', limit: 1 }),
      supabaseSelect<UserRow>('users', { username: `eq.${input.username}`, select: '*', limit: 1 }),
    ]);
    if (existingEmail[0] || existingUsername[0]) {
      return null;
    }

    const user = {
      id: `u_${randomBytes(10).toString('hex')}`,
      email: input.email,
      username: input.username,
      password_hash: hashPassword(input.password),
      first_name: input.firstName ?? null,
      last_name: input.lastName ?? null,
      bio: '',
      whatsapp_number: input.whatsappNumber,
      avatar_url: '',
      plan: 'Free' as const,
      subscription_renewal_date: '',
      created_at: new Date().toISOString(),
    };

    const [created] = await supabaseInsert<UserRow>('users', user);
    return created ? toUserProfile(created) : null;
  }

  if (findUserByEmailStmt.get(input.email) || findUserByUsernameStmt.get(input.username)) {
    requireDb();
    return null;
  }

  const userId = `u_${randomBytes(10).toString('hex')}`;
  const now = new Date().toISOString();
  const user = {
    id: userId,
    email: input.email,
    username: input.username,
    password_hash: hashPassword(input.password),
    first_name: input.firstName ?? null,
    last_name: input.lastName ?? null,
    bio: '',
    whatsapp_number: input.whatsappNumber,
    avatar_url: '',
    plan: 'Free' as const,
    subscription_renewal_date: '',
    created_at: now,
  };

  insertUserStmt.run(user);
  return toUserProfile(user as UserRow);
}

export async function authenticateUser(email: string, password: string) {
  const row = isSupabaseEnabled()
    ? (await supabaseSelect<UserRow>('users', { email: `eq.${email}`, select: '*', limit: 1 }))[0]
    : (findUserByEmailStmt.get(email) as UserRow | undefined);
  if (!row || !verifyPassword(password, row.password_hash)) {
    return null;
  }
  return toUserProfile(row);
}

export async function getUserById(userId: string) {
  const row = isSupabaseEnabled()
    ? (await supabaseSelect<UserRow>('users', { id: `eq.${userId}`, select: '*', limit: 1 }))[0]
    : (findUserByIdStmt.get(userId) as UserRow | undefined);
  return row ? toUserProfile(row) : null;
}

function normalizeUsername(input: string) {
  return input.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
}

function rewriteUploadPath(value: string | null, previousUsername: string, nextUsername: string) {
  if (!value) return value;
  const from = `/uploads/${previousUsername}/`;
  const to = `/uploads/${nextUsername}/`;
  return value.includes(from) ? value.replaceAll(from, to) : value;
}

async function moveUploadDirectory(previousUsername: string, nextUsername: string) {
  if (previousUsername === nextUsername) {
    return;
  }

  const previousDir = path.join(process.cwd(), 'public', 'uploads', previousUsername);
  const nextDir = path.join(process.cwd(), 'public', 'uploads', nextUsername);

  try {
    await stat(previousDir);
  } catch {
    return;
  }

  await cp(previousDir, nextDir, { recursive: true, force: true });
  await rm(previousDir, { recursive: true, force: true });
}

export async function updateAuthUserProfile(userId: string, updates: Partial<UserProfile>) {
  const row = isSupabaseEnabled()
    ? (await supabaseSelect<UserRow>('users', { id: `eq.${userId}`, select: '*', limit: 1 }))[0]
    : (findUserByIdStmt.get(userId) as UserRow | undefined);
  if (!row) {
    return null;
  }

  const requestedUsername = updates.username ? normalizeUsername(updates.username) : row.username;
  if (!requestedUsername) {
    return null;
  }

  const existingUsernameRow = isSupabaseEnabled()
    ? (await supabaseSelect<UserRow>('users', { username: `eq.${requestedUsername}`, select: '*', limit: 1 }))[0]
    : (findUserByUsernameStmt.get(requestedUsername) as UserRow | undefined);
  if (requestedUsername !== row.username && existingUsernameRow && existingUsernameRow.id !== row.id) {
    return 'USERNAME_TAKEN' as const;
  }

  const nextRow: UserRow = {
    ...row,
    username: requestedUsername,
    first_name: updates.firstName ?? row.first_name,
    last_name: updates.lastName ?? row.last_name,
    bio: updates.bio ?? row.bio,
    whatsapp_number: updates.whatsappNumber ?? row.whatsapp_number,
    avatar_url: isSupabaseEnabled()
      ? (updates.avatarUrl ?? row.avatar_url)
      : rewriteUploadPath(updates.avatarUrl ?? row.avatar_url, row.username, requestedUsername),
    plan: updates.plan ?? row.plan,
    subscription_renewal_date: updates.subscriptionRenewalDate ?? row.subscription_renewal_date,
  };

  if (isSupabaseEnabled()) {
    const [storeAssets] = await supabaseSelect<StoreAssetRow>('stores', {
      username: `eq.${row.username}`,
      select: 'logo_url,banners_json',
      limit: 1,
    });
    const nextLogoUrl = storeAssets?.logo_url ?? null;
    const nextBanners = storeAssets?.banners_json ? JSON.parse(storeAssets.banners_json) : [];

    await supabasePatch<UserRow>(
      'users',
      {
        username: requestedUsername,
        first_name: nextRow.first_name,
        last_name: nextRow.last_name,
        bio: nextRow.bio,
        whatsapp_number: nextRow.whatsapp_number,
        avatar_url: nextRow.avatar_url,
        plan: nextRow.plan,
        subscription_renewal_date: nextRow.subscription_renewal_date,
      },
      { id: `eq.${row.id}` }
    );

    await supabasePatch<StoreAssetRow>(
      'stores',
      {
        username: requestedUsername,
        first_name: nextRow.first_name,
        last_name: nextRow.last_name,
        user_bio: nextRow.bio,
        whatsapp_number: nextRow.whatsapp_number,
        avatar_url: nextRow.avatar_url,
        logo_url: nextLogoUrl,
        banners_json: nextBanners,
        plan: nextRow.plan,
        subscription_renewal_date: nextRow.subscription_renewal_date,
      },
      { username: `eq.${row.username}` }
    );

    return toUserProfile(nextRow);
  }

  const renameTxn = db.transaction(() => {
    requireDb();
    updateUserStmt.run(nextRow);
    const storeAssets = selectStoreAssetsStmt.get(row.username) as StoreAssetRow | undefined;
    const nextLogoUrl = rewriteUploadPath(storeAssets?.logo_url ?? null, row.username, requestedUsername);
    const banners = storeAssets?.banners_json ? JSON.parse(storeAssets.banners_json) : [];
    const nextBanners = Array.isArray(banners)
      ? banners.map((banner) => rewriteUploadPath(banner, row.username, requestedUsername))
      : banners;
    if (requestedUsername !== row.username) {
      renameUserStmt.run({ id: row.id, next_username: requestedUsername });
      insertRenamedStoreStmt.run({
        previous_username: row.username,
        next_username: requestedUsername,
        first_name: nextRow.first_name,
        last_name: nextRow.last_name,
        bio: nextRow.bio,
        whatsapp_number: nextRow.whatsapp_number,
        avatar_url: nextRow.avatar_url,
        logo_url: nextLogoUrl,
        banners_json: JSON.stringify(nextBanners),
      });
      renameProductsOwnerStmt.run(requestedUsername, row.username);
      renameOrdersOwnerStmt.run(requestedUsername, row.username);
      renameAnalyticsOwnerStmt.run(requestedUsername, row.username);
      deleteStoreStmt.run(row.username);

      const productRows = db.prepare('SELECT product_id, image_url, images_json FROM products WHERE store_username = ?').all(requestedUsername) as Array<{
        product_id: string;
        image_url: string;
        images_json: string | null;
      }>;
      for (const product of productRows) {
        const nextImageUrl = rewriteUploadPath(product.image_url, row.username, requestedUsername) ?? product.image_url;
        const images = product.images_json ? JSON.parse(product.images_json) : [];
        const nextImages = Array.isArray(images)
          ? images.map((image) => rewriteUploadPath(image, row.username, requestedUsername))
          : images;
        rewriteProductImageUrlsStmt.run({
          store_username: requestedUsername,
          product_id: product.product_id,
          image_url: nextImageUrl,
          images_json: JSON.stringify(nextImages),
        });
      }
    } else {
      db.prepare(`
        UPDATE stores
        SET
          first_name = @first_name,
          last_name = @last_name,
          user_bio = @bio,
          whatsapp_number = @whatsapp_number,
          avatar_url = @avatar_url,
          logo_url = @logo_url,
          banners_json = @banners_json
        WHERE username = @username
      `).run({
        username: requestedUsername,
        first_name: nextRow.first_name,
        last_name: nextRow.last_name,
        bio: nextRow.bio,
        whatsapp_number: nextRow.whatsapp_number,
        avatar_url: nextRow.avatar_url,
        logo_url: nextLogoUrl,
        banners_json: JSON.stringify(nextBanners),
      });
    }
  });

  renameTxn();
  void moveUploadDirectory(row.username, requestedUsername);
  return toUserProfile(nextRow);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex');
  const createdAt = new Date();
  const expiresAt = new Date(createdAt);
  expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);
  if (isSupabaseEnabled()) {
    await supabaseInsert('sessions', {
      token,
      user_id: userId,
      expires_at: expiresAt.toISOString(),
      created_at: createdAt.toISOString(),
    });
  } else {
    insertSessionStmt.run(token, userId, expiresAt.toISOString(), createdAt.toISOString());
  }
  return {
    token,
    expiresAt,
  };
}

export async function deleteSession(token: string) {
  if (isSupabaseEnabled()) {
    await supabaseDelete('sessions', { token: `eq.${token}` });
    return;
  }

  deleteSessionStmt.run(token);
}

export async function getSessionUserByToken(token?: string | null) {
  if (!token) {
    return null;
  }
  if (isSupabaseEnabled()) {
    const now = new Date().toISOString();
    const [session] = await supabaseSelect<{ user_id: string }>('sessions', {
      token: `eq.${token}`,
      expires_at: `gt.${now}`,
      select: 'user_id',
      limit: 1,
    });
    if (!session?.user_id) {
      return null;
    }
    return getUserById(session.user_id);
  }

  const row = findSessionStmt.get(token) as UserRow | undefined;
  return row ? toUserProfile(row) : null;
}

export async function getCurrentSessionUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return getSessionUserByToken(token);
}

export async function getRequestSessionUser(request: NextRequest) {
  return getSessionUserByToken(request.cookies.get(SESSION_COOKIE)?.value ?? null);
}

export function applySessionCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    expires: expiresAt,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: '',
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}
