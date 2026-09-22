import Link from "next/link";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { demandListItems, demandLists, products } from "@/db/schema";
import { getAnonId } from "@/lib/session";
import { unitPhrase } from "@/lib/format";
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
          quantity: demandListItems.quantity,
          unitLabel: demandListItems.unitLabel,
          name: products.name,
        })
        .from(demandListItems)
        .innerJoin(products, eq(demandListItems.productId, products.id))
        .where(eq(demandListItems.listId, list.id))
        .orderBy(asc(products.sortOrder))
    : [];

  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 pb-16">
        <div className="mx-auto max-w-2xl pt-12">
          <div className="grid size-11 place-items-center rounded-full bg-accent text-lg text-accent-contrast">
            &#10003;
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            Your demand has been recorded
          </h1>
          <p className="mt-2 text-muted">We&rsquo;ve saved your list.</p>

          {items.length > 0 && (
            <section
              className="mt-7 rounded-xl border border-border bg-surface p-4 sm:p-5"
              style={{ boxShadow: "var(--shadow)" }}
            >
              <h2 className="mb-3 font-semibold">Your selected items</h2>
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span>{item.name}</span>
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
              className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-accent px-6 font-semibold text-accent-contrast hover:bg-accent-hover"
            >
              Update my list
            </Link>
            <a
              href="https://wa.me/?text=I%20just%20added%20what%20I%20want%20to%20buy%20in%20bulk.%20When%20enough%20of%20us%20want%20the%20same%20thing%20we%20get%20bulk%20prices%20together%20%E2%80%94%20add%20yours%3A%20"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-border-strong px-6 font-medium hover:bg-surface-raised"
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
