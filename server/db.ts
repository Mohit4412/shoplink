import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import path from 'path';
import { isSupabaseEnabled } from '@/server/supabase';

const dbPath = process.env.MYSHOPLINK_DB_PATH
  ? path.resolve(process.env.MYSHOPLINK_DB_PATH)
  : path.join(process.cwd(), 'server', 'myshoplink.db');

const globalForDb = globalThis as unknown as { sqliteDb: ReturnType<typeof Database> | undefined };

export const db = isSupabaseEnabled()
  ? null
  : globalForDb.sqliteDb ?? (() => {
      mkdirSync(path.dirname(dbPath), { recursive: true });
      const inst = new Database(dbPath);
      // Cache connection in dev to avoid 'database is locked' errors from HMR
      if (process.env.NODE_ENV !== 'production') {
        globalForDb.sqliteDb = inst;
      }
      return inst;
    })();

export function requireDb() {
  if (!db) {
    throw new Error('SQLite is unavailable while Supabase mode is enabled');
  }

  return db;
}
