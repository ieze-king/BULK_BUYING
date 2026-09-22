import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { demandListItems, demandLists, events, lgas, products, states } from "@/db/schema";
import { getAnonId } from "@/lib/session";
import { LAGOS_CODE } from "@/lib/naija";
import { SiteHeader } from "@/components/site-header";
import { ListForm } from "./list-form";

export const dynamic = "force-dynamic";

export default async function ListPage() {
  const anonId = await getAnonId();

  const list = anonId
    ? (
        await db
          .select()
          .from(demandLists)
          .where(and(eq(demandLists.anonId, anonId), eq(demandLists.status, "draft")))
          .limit(1)
      )[0]
    : undefined;

  const items = list
    ? await db
        .select({
          id: demandListItems.id,
          productId: demandListItems.productId,
          quantity: demandListItems.quantity,
          unitLabel: demandListItems.unitLabel,
          name: products.name,
          category: products.category,
        })
        .from(demandListItems)
        .innerJoin(products, eq(demandListItems.productId, products.id))
        .where(eq(demandListItems.listId, list.id))
        .orderBy(asc(products.name))
    : [];

  if (!list || items.length === 0) {
    return (
      <>
        <SiteHeader />
        <main className="flex-1 px-4 py-20">
          <div className="mx-auto max-w-md text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Your list is empty
            </h1>
            <p className="mt-2 text-muted">
              Add what you want to buy in bulk and it will show up here.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex h-12 items-center rounded-xl bg-accent px-6 font-semibold text-accent-contrast"
            >
              Browse products
            </Link>
          </div>
        </main>
      </>
    );
  }

  // Once per list, not once per render: this page is dynamic and can re-render.
  const seen = await db
    .select({ id: events.id })
    .from(events)
    .where(and(eq(events.listId, list.id), eq(events.type, "reached_submit")))
    .limit(1);
  if (seen.length === 0) {
    await db.insert(events).values({ anonId, listId: list.id, type: "reached_submit" });
  }

  const [allStates, lagosLgas] = await Promise.all([
    db.select().from(states).orderBy(asc(states.name)),
    db.select().from(lgas).where(eq(lgas.stateCode, LAGOS_CODE)).orderBy(asc(lgas.name)),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 pb-16">
        <div className="mx-auto max-w-2xl">
          <div className="pt-8 pb-6">
            <Link href="/" className="text-sm text-muted underline underline-offset-4">
              &larr; Add more items
            </Link>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              Your bulk-buying list
            </h1>
            <p className="mt-2 text-muted">
              Check the quantities, tell us where you are, and we will save it.
            </p>
          </div>

          <ListForm items={items} states={allStates} lagosLgas={lagosLgas} />
        </div>
      </main>
    </>
  );
}
