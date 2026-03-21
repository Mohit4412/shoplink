import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import path from 'path';
import { isSupabaseEnabled } from '@/server/supabase';

const dbPath = process.env.SHOPLINK_DB_PATH
  ? path.resolve(process.env.SHOPLINK_DB_PATH)
  : path.join(process.cwd(), 'server', 'shoplink.db');

export const db = isSupabaseEnabled()
  ? null
  : (() => {
      mkdirSync(path.dirname(dbPath), { recursive: true });
      return new Database(dbPath);
    })();

export function requireDb() {
  if (!db) {
    throw new Error('SQLite is unavailable while Supabase mode is enabled');
  }

  return db;
}
