import { rm } from 'fs/promises';
import path from 'path';
import { deleteSupabaseObject, getSupabaseObjectPathFromUrl, isSupabaseEnabled } from '@/server/supabase';

function normalizeOwnedUploadPath(username: string, url: string) {
  const supabasePath = getSupabaseObjectPathFromUrl(url);
  if (supabasePath) {
    const prefix = `${username}/`;
    return supabasePath.startsWith(prefix) ? supabasePath : null;
  }

  const normalizedUrl = url.replace(/^https?:\/\/[^/]+/i, '');
  const prefix = `/uploads/${username}/`;
  if (!normalizedUrl.startsWith(prefix)) {
    return null;
  }
  const relativePath = normalizedUrl.slice(1);
  return path.join(process.cwd(), 'public', relativePath);
}

export function isOwnedUploadUrl(username: string, url?: string | null) {
  return Boolean(url && normalizeOwnedUploadPath(username, url));
}

export async function deleteUploadedAsset(username: string, url?: string | null) {
  const ownedPath = url ? normalizeOwnedUploadPath(username, url) : null;
  if (!ownedPath) {
    return false;
  }

  if (isSupabaseEnabled()) {
    return deleteSupabaseObject(ownedPath);
  }

  await rm(ownedPath, { force: true });
  return true;
}

export async function deleteUploadedAssets(username: string, urls: Array<string | null | undefined>) {
  await Promise.all(urls.map((url) => deleteUploadedAsset(username, url)));
}
