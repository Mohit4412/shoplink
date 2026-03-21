import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import path from 'path';

const dbPath = process.env.SHOPLINK_DB_PATH
  ? path.resolve(process.env.SHOPLINK_DB_PATH)
  : path.join(process.cwd(), 'server', 'shoplink.db');

mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
