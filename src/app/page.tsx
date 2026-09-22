import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { CATEGORY_ORDER } from "@/lib/catalog";
import { DemandBuilder } from "@/components/demand-builder";

/**
 * Cached: the catalogue changes rarely, and the first paint of the page people
 * reach from a WhatsApp link must not wait on a sleeping database.
 */
export const revalidate = 3600;

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
    .orderBy(asc(products.sortOrder), asc(products.name));

  const categories = CATEGORY_ORDER.filter((c) => rows.some((r) => r.category === c));

  return <DemandBuilder products={rows} categories={categories} />;
}
