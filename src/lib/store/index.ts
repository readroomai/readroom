import 'server-only';
import { capabilities } from '@/lib/env';
import type { Store } from './interface';
import { FileStore } from './file-store';
import { PgStore } from './pg-store';

let _store: Store | null = null;

/**
 * Returns the active store: Postgres/Drizzle when DATABASE_URL is configured,
 * otherwise a file-backed store for local/demo use. Both satisfy the same
 * ownership-scoped contract, so nothing above this line changes between modes.
 * The Postgres driver only opens a connection when a query actually runs.
 */
export function getStore(): Store {
  if (_store) return _store;
  _store = capabilities.database ? new PgStore() : new FileStore();
  return _store;
}

export type { Store, HistoryFilter } from './interface';
