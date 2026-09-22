import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { lgas, products, states } from "@/db/schema";
import { CATEGORY_ORDER } from "@/lib/catalog";
import { LAGOS_CODE } from "@/lib/naija";
import { SiteHeader } from "@/components/site-header";
import { StartForm } from "./start-form";

export const revalidate = 3600;

export default async function StartPage() {
  const [items, allStates, lagosLgas] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        category: products.category,
        unitLabel: products.unitLabel,
        aliases: products.aliases,
      })
      .from(products)
      .where(eq(products.active, true))
      .orderBy(asc(products.name)),
    db.select().from(states).orderBy(asc(states.name)),
    db.select().from(lgas).where(eq(lgas.stateCode, LAGOS_CODE)).orderBy(asc(lgas.name)),
  ]);

  const categories = CATEGORY_ORDER.filter((c) => items.some((i) => i.category === c));

  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 pb-20">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/"
            className="mt-6 inline-block text-sm font-semibold underline underline-offset-4"
          >
            &larr; All pools
          </Link>

          <h1 className="font-display mt-5 text-3xl font-black sm:text-5xl">
            Start a pool
          </h1>
          <p className="mt-3 text-lg">
            Pick what you want to buy and where you are. If a pool already exists near
            you for that item, we will put you straight into it rather than splitting
            everyone up.
          </p>

          <StartForm
            products={items}
            categories={categories}
            states={allStates}
            lagosLgas={lagosLgas}
          />
        </div>
      </main>
    </>
  );
}
