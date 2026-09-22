import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { CATEGORY_ORDER } from "@/lib/catalog";
import { DemandBuilder } from "@/components/demand-builder";
import { getInterestCounts, MIN_TOTAL_TO_SHOW } from "@/lib/interest";

/**
 * Cached for five minutes: long enough that the first paint of a link opened
 * from WhatsApp never waits on a sleeping database, short enough that the
 * interest counts stay roughly current.
 */
export const revalidate = 300;

export default async function Home() {
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      category: products.category,
      unitLabel: products.unitLabel,
      aliases: products.aliases,
    })
    .from(products)
    .where(eq(products.active, true))
    .orderBy(asc(products.name));

  const categories = CATEGORY_ORDER.filter((c) => rows.some((r) => r.category === c));
  const { byProduct, totalPeople } = await getInterestCounts();

  return (
    <DemandBuilder
      products={rows}
      categories={categories}
      interestByProduct={byProduct}
      totalPeople={totalPeople >= MIN_TOTAL_TO_SHOW ? totalPeople : 0}
    />
  );
}
