import "../lib/load-env";
import { readdirSync, readFileSync } from "fs";
import { createHash } from "crypto";
import { join } from "path";
import { Pool } from "pg";

/**
 * Applies every pending file in migrations/, in filename order.
 *
 * This runs as part of the build, so a schema change ships with the code that
 * needs it. Applying them by hand is what broke production twice: the deploy
 * went out, the SQL did not, and every visitor got a server error.
 *
 * Rules it relies on:
 *   - Files are applied in filename order and never renamed.
 *   - Each file runs inside one transaction, so a failure leaves nothing half
 *     applied.
 *   - An advisory lock serialises concurrent builds, which Vercel does run.
 *   - A checksum catches a file edited after it was applied, which would mean
 *     the database and the repo disagree about what that migration did.
 */

const DIR = join(process.cwd(), "migrations");
const LOCK_KEY = 8_271_553; // arbitrary, just has to be stable

function checksum(sql: string) {
  return createHash("sha256").update(sql).digest("hex").slice(0, 16);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // A build with no database is legitimate: the very first deploy happens
    // before the variable is set. Say so loudly rather than failing.
    console.warn("[migrate] DATABASE_URL is not set, skipping migrations.");
    return;
  }

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
    max: 1,
  });
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        filename text PRIMARY KEY,
        checksum text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await client.query("SELECT pg_advisory_lock($1)", [LOCK_KEY]);

    const applied = new Map<string, string>(
      (await client.query<{ filename: string; checksum: string }>(
        "SELECT filename, checksum FROM _migrations",
      )).rows.map((r) => [r.filename, r.checksum]),
    );

    const files = readdirSync(DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    let ran = 0;
    for (const file of files) {
      const sql = readFileSync(join(DIR, file), "utf8");
      const sum = checksum(sql);
      const seen = applied.get(file);

      if (seen) {
        if (seen !== sum) {
          throw new Error(
            `[migrate] ${file} changed after it was applied. Migrations are a ` +
              `record of what the database has already done, so edit forward ` +
              `with a new file rather than changing this one.`,
          );
        }
        continue;
      }

      console.log(`[migrate] applying ${file}`);
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query(
          "INSERT INTO _migrations (filename, checksum) VALUES ($1, $2)",
          [file, sum],
        );
        await client.query("COMMIT");
        ran += 1;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    console.log(
      ran === 0
        ? `[migrate] nothing to do, ${files.length} already applied.`
        : `[migrate] applied ${ran} of ${files.length}.`,
    );
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [LOCK_KEY]).catch(() => {});
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("[migrate] failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
