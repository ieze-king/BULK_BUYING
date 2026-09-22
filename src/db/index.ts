import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * node-postgres rather than the Neon HTTP driver: the same client then works
 * against local Postgres in development and Neon in production, with no
 * driver swap and no second code path to keep honest.
 *
 * The connection is opened lazily on first query rather than at import. A
 * build should not need a reachable database, and failing at import time
 * turns a missing environment variable into an opaque "failed to collect page
 * data" error instead of a clear one at the moment a query actually runs.
 */
const globalForDb = globalThis as unknown as {
  pool?: Pool;
  db?: NodePgDatabase<typeof schema>;
};

function connect(): NodePgDatabase<typeof schema> {
  if (globalForDb.db) return globalForDb.db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  }

  const pool =
    globalForDb.pool ??
    new Pool({
      connectionString,
      // Neon and most hosted Postgres require TLS; local sockets do not.
      ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
      max: 5,
    });

  const instance = drizzle(pool, { schema });
  if (process.env.NODE_ENV !== "production") {
    globalForDb.pool = pool;
    globalForDb.db = instance;
  }
  return instance;
}

export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop) {
    const real = connect();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export { schema };
