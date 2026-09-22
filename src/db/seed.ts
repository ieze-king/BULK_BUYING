import "../lib/load-env";
import { notInArray, sql } from "drizzle-orm";
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

  // Anything dropped from the catalogue is retired rather than deleted: old
  // demand rows still reference it, so it must keep existing.
  const retired = await db
    .update(products)
    .set({ active: false })
    .where(notInArray(products.slug, CATALOG.map((p) => p.slug)))
    .returning({ slug: products.slug });
  if (retired.length > 0) {
    console.log(`Retired ${retired.length}: ${retired.map((r) => r.slug).join(", ")}`);
  }

  console.log(
    `Done: ${STATES.length} states, ${LAGOS_LGAS.length} Lagos LGAs, ${CATALOG.length} products.`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
