import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@workspace/db/schema";

const { Pool } = pg;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set.");
  }
  return new Pool({ connectionString: process.env.DATABASE_URL });
}

let _pool: pg.Pool | undefined;
let _db: ReturnType<typeof drizzle> | undefined;

export function getDb() {
  if (!_db) {
    _pool = getPool();
    _db = drizzle(_pool, { schema });
  }
  return _db;
}

/** @deprecated Use getDb() for lazy initialization. Kept for convenience. */
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export { schema };
