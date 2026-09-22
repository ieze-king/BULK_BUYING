import "../lib/load-env";
import { eq, inArray } from "drizzle-orm";
import { db } from "./index";
import { lgas, people, poolMembers, pools, products } from "./schema";
import { findOrCreatePool, joinPool } from "../lib/pools";

/**
 * Demo data for looking at the interface locally. Never run this against
 * production: fabricated pools are fake social proof, which is exactly the
 * thing the rest of this codebase refuses to do.
 *
 *   npm run db:demo        seed
 *   npm run db:demo -- clear
 */

const SEED: { slug: string; lga: string; joins: [number, boolean][] }[] = [
  { slug: "rice-50kg", lga: "Ikeja", joins: [[20, true], [5, true], [3, false], [12, true], [8, true], [2, true]] },
  { slug: "cement", lga: "Ikeja", joins: [[100, true], [50, true], [200, false]] },
  { slug: "minerals", lga: "Surulere", joins: [[10, true], [6, true], [4, true], [15, true]] },
  { slug: "cooking-oil-25l", lga: "Ikeja", joins: [[4, true], [2, false], [6, true]] },
  { slug: "noodles", lga: "Alimosho", joins: [[8, true], [3, true]] },
  { slug: "frozen-chicken", lga: "Eti-Osa", joins: [[5, true], [2, true], [9, true]] },
  { slug: "tomato-paste", lga: "Ikorodu", joins: [[7, false], [3, true]] },
  { slug: "detergent", lga: "Surulere", joins: [[12, true]] },
];

const TYPES = ["household", "business", "retail", "other"] as const;

async function clear() {
  const demo = await db.select({ id: people.id }).from(people);
  const ids = demo.map((d) => d.id);
  if (ids.length > 0) {
    await db.delete(poolMembers).where(inArray(poolMembers.personId, ids));
  }
  await db.delete(pools);
  await db.delete(people);
  console.log("Demo data cleared.");
}

async function main() {
  if (process.argv.includes("clear")) {
    await clear();
    process.exit(0);
  }

  let n = 0;
  for (const entry of SEED) {
    const product = (
      await db.select().from(products).where(eq(products.slug, entry.slug)).limit(1)
    )[0];
    const lga = (await db.select().from(lgas).where(eq(lgas.name, entry.lga)).limit(1))[0];
    if (!product || !lga) {
      console.warn(`skipped ${entry.slug} in ${entry.lga}`);
      continue;
    }

    for (const [i, [quantity, interested]] of entry.joins.entries()) {
      const anonId = `demo-${entry.slug}-${entry.lga}-${i}`;
      const person = (
        await db
          .insert(people)
          .values({
            anonId,
            name: `Demo ${n + 1}`,
            phoneNormalized: `234800000${String(1000 + n).slice(-4)}`,
            participantType: TYPES[n % TYPES.length],
            consentedAt: new Date(),
          })
          .onConflictDoUpdate({ target: people.anonId, set: { lastSeenAt: new Date() } })
          .returning()
      )[0];

      const pool = await findOrCreatePool({
        productId: product.id,
        stateCode: "LA",
        lgaId: lga.id,
        areaLabel: null,
        startedBy: person.id,
      });
      await joinPool(pool.id, person.id, quantity, interested);
      n += 1;
    }
  }

  console.log(`Seeded ${SEED.length} demo pools with ${n} members.`);
  console.log("Clear them with: npm run db:demo -- clear");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
