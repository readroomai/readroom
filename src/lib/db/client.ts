import 'server-only';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/lib/env';
import * as schema from './schema';

let _db: PostgresJsDatabase<typeof schema> | null = null;

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!env.database.url) {
    throw new Error('DATABASE_URL is not configured.');
  }
  if (!_db) {
    const client = postgres(env.database.url, { prepare: false, max: 5 });
    _db = drizzle(client, { schema });
  }
  return _db;
}

export { schema };
