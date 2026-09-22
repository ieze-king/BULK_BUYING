import Link from "next/link";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { demandListItems, demandLists, products } from "@/db/schema";
import { getAnonId } from "@/lib/session";
import { peoplePhrase, unitPhrase } from "@/lib/format";
import { getInterestCounts } from "@/lib/interest";
import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";

export default async function DonePage() {
  const anonId = await getAnonId();

  const list = anonId
    ? (
        await db
          .select()
          .from(demandLists)
          .where(
            and(
              eq(demandLists.anonId, anonId),
              eq(demandLists.status, "submitted"),
              isNull(demandLists.supersededAt),
            ),
          )
          .orderBy(desc(demandLists.submittedAt))
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
        })
        .from(demandListItems)
        .innerJoin(products, eq(demandListItems.productId, products.id))
        .where(eq(demandListItems.listId, list.id))
        .orderBy(asc(products.name))
    : [];

  // Social proof, to make the share button below feel worth pressing.
  const { byProduct } = await getInterestCounts();

  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 pb-16">
        <div className="mx-auto max-w-2xl pt-12">
          <div
            className="grid size-14 place-items-center rounded-2xl border-2 border-foreground text-2xl text-accent-contrast"
            style={{ background: "var(--accent)", boxShadow: "4px 4px 0 0 var(--marigold)" }}
          >
            &#10003;
          </div>
          <h1 className="font-display mt-6 text-3xl font-black sm:text-5xl">
            Your demand has been recorded
          </h1>
          <p className="mt-2 text-muted">We&rsquo;ve saved your list.</p>

          {items.length > 0 && (
            <section className="pop mt-8 rounded-3xl bg-surface p-5 sm:p-6">
              <h2 className="font-display mb-4 text-xl font-black">Your selected items</h2>
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className="min-w-0">
                      <span className="block">{item.name}</span>
                      {byProduct[item.productId] ? (
                        <span className="block text-sm font-bold" style={{ color: "var(--coral)" }}>
                          {peoplePhrase(byProduct[item.productId])} want this
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-muted tabular-nums">
                      {unitPhrase(item.quantity, item.unitLabel)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-7 space-y-4 leading-relaxed text-muted">
            <p>
              <strong className="text-foreground">What happens next:</strong> we combine
              your list with everyone else&rsquo;s. Once enough people want the same
              item, we take that combined quantity to suppliers and negotiate a bulk
              price, then contact you with it.
            </p>
            <p>
              Nothing is owed and nothing is ordered. You will only hear from us when
              there is a real price on the table.
            </p>
            <p className="text-foreground">
              You can come back anytime to update your list.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="pop inline-flex flex-1 items-center justify-center rounded-2xl bg-accent px-6 py-3.5 font-bold text-accent-contrast transition-transform hover:-translate-y-1"
            >
              Update my list
            </Link>
            <a
              href="https://wa.me/?text=I%20just%20added%20what%20I%20want%20to%20buy%20in%20bulk.%20When%20enough%20of%20us%20want%20the%20same%20thing%20we%20get%20bulk%20prices%20together%20%E2%80%94%20add%20yours%3A%20"
              target="_blank"
              rel="noopener noreferrer"
              className="pop inline-flex flex-1 items-center justify-center rounded-2xl px-6 py-3.5 font-bold transition-transform hover:-translate-y-1"
              style={{ background: "var(--marigold)" }}
            >
              Share on WhatsApp
            </a>
          </div>
          <p className="mt-3 text-sm text-muted">
            The more people who join, the sooner we reach bulk quantity.
          </p>
        </div>
      </main>
    </>
  );
}
