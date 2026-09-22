import "../lib/load-env";
import { sql } from "drizzle-orm";
import { db } from "./index";
import { lgas, products, states } from "./schema";
import { CATALOG } from "../lib/catalog";
import { LAGOS_CODE, LAGOS_LGAS, STATES } from "../lib/naija";

/** `excluded.<col>` refers to the row Postgres tried to insert, in an upsert. */
const excluded = (column: string) => sql.raw(`excluded.${column}`);

/** Idempotent: safe to re-run after editing the catalogue or prices. */
async function main() {
  console.log("Seeding states...");
  await db.insert(states).values(STATES).onConflictDoNothing();

  console.log("Seeding Lagos LGAs...");
  await db
    .insert(lgas)
    .values(LAGOS_LGAS.map((name) => ({ stateCode: LAGOS_CODE, name })))
    .onConflictDoNothing();

  console.log("Seeding catalogue...");
  await db
    .insert(products)
    .values(CATALOG.map((p, i) => ({ ...p, sortOrder: i })))
    .onConflictDoUpdate({
      target: products.slug,
      set: {
        name: excluded("name"),
        category: excluded("category"),
        unitLabel: excluded("unit_label"),
        indicativePriceNgn: excluded("indicative_price_ngn"),
        aliases: excluded("aliases"),
        sortOrder: excluded("sort_order"),
      },
    });

  console.log(
    `Done: ${STATES.length} states, ${LAGOS_LGAS.length} Lagos LGAs, ${CATALOG.length} products.`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
