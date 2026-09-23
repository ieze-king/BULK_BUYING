import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { lgas, products, states } from "@/db/schema";
import { CATEGORY_ORDER } from "@/lib/catalog";
import { SiteHeader } from "@/components/site-header";
import { StartForm } from "./start-form";

export const dynamic = "force-dynamic";

export default async function StartPage({ searchParams }: PageProps<"/start">) {
  const sp = await searchParams;
  const preselect = Number(sp.product) || null;
  const [items, allStates, allLgas] = await Promise.all([
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
    db
      .select({ id: lgas.id, stateCode: lgas.stateCode, name: lgas.name })
      .from(lgas)
      .orderBy(asc(lgas.name)),
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
            lgas={allLgas}
            preselectId={preselect}
          />
        </div>
      </main>
    </>
  );
}
