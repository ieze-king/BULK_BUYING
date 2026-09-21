import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { CATEGORY_ORDER } from "@/lib/catalog";
import { DemandBuilder } from "@/components/demand-builder";

/**
 * Cached for an hour: the catalogue changes rarely, and the first paint of the
 * page people reach from a WhatsApp link must not wait on a sleeping database.
 */
export const revalidate = 3600;

export default async function Home() {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.active, true))
    .orderBy(asc(products.sortOrder), asc(products.name));

  const byCategory = CATEGORY_ORDER.map((category) => ({
    category,
    items: rows.filter((r) => r.category === category),
  })).filter((g) => g.items.length > 0);

  return (
    <main className="flex-1">
      <header className="px-4 pt-10 pb-6 max-w-2xl mx-auto">
        <p className="text-sm font-medium text-accent">Bulk buying, together</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
          What do you want to buy in bulk?
        </h1>
        <p className="mt-3 text-muted leading-relaxed">
          Pick what you need and how much. When enough people near you want the same
          thing, we go to distributors together and get bulk prices nobody gets alone.
        </p>
      </header>

      <DemandBuilder groups={byCategory} />
    </main>
  );
}
