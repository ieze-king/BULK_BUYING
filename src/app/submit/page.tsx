import Link from "next/link";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { demandListItems, demandLists, events, lgas, products, states } from "@/db/schema";
import { getAnonId } from "@/lib/session";
import { LAGOS_CODE } from "@/lib/naija";
import { SubmitForm } from "./submit-form";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
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
          quantity: demandListItems.quantity,
          unitLabel: demandListItems.unitLabel,
          indicativePriceNgn: demandListItems.indicativePriceNgn,
          name: products.name,
        })
        .from(demandListItems)
        .innerJoin(products, eq(demandListItems.productId, products.id))
        .where(eq(demandListItems.listId, list.id))
        .orderBy(asc(products.sortOrder))
    : [];

  if (!list || items.length === 0) {
    return (
      <main className="flex-1 px-4 py-16 max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold">Your list is empty</h1>
        <p className="mt-2 text-muted">Pick a few items and we will take it from there.</p>
        <Link
          href="/"
          className="mt-6 inline-flex h-12 items-center rounded-xl bg-accent px-6 font-semibold text-accent-contrast"
        >
          Choose items
        </Link>
      </main>
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

  const estimate = items.reduce(
    (sum, i) => sum + (i.indicativePriceNgn ?? 0) * i.quantity,
    0,
  );

  return (
    <main className="flex-1 px-4 py-8 max-w-2xl mx-auto">
      <Link href="/" className="text-sm text-muted underline underline-offset-4">
        &larr; Change my items
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Almost done</h1>
      <p className="mt-2 text-muted">
        We only need to know where you are and how to reach you when your items reach
        bulk quantity.
      </p>

      <SubmitForm
        items={items}
        estimate={estimate}
        states={allStates}
        lagosLgas={lagosLgas}
      />
    </main>
  );
}
