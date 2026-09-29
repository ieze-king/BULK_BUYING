import Link from "next/link";
import { categoryHue } from "@/lib/category-style";
import { closingSoonLabel, peoplePhrase, unitPhrase } from "@/lib/format";
import { poolState, type PoolSummary } from "@/lib/pools";

const STATE_LABEL = {
  open: "Growing",
  goal_reached: "Goal reached",
  closed: "Closed",
} as const;

/**
 * The pools this device is in.
 *
 * With no accounts, the link is the only way back to a pool, and people lose
 * links. This is the way back. Rows rather than bubbles: the field says what is
 * happening across the site, this says what is happening to you, and the two
 * should not look like the same thing.
 */
export function MyPools({ pools }: { pools: PoolSummary[] }) {
  if (pools.length === 0) return null;

  return (
    <section className="mx-auto mt-2 mb-10 max-w-3xl px-4">
      <h2 className="font-display text-xl font-black">Your pools</h2>
      <p className="mt-1 text-sm text-muted">
        Everything you have joined on this device. Closed ones stay here, because
        closing is when the group has to sort out who orders.
      </p>

      <ul className="mt-4 space-y-2.5">
        {pools.map((pool) => {
          const state = poolState(pool);
          const closing = state === "goal_reached" ? closingSoonLabel(pool.closes_at) : null;
          return (
            <li key={pool.slug}>
              <Link
                href={`/pool/${pool.slug}`}
                className="pop flex items-center gap-3 rounded-2xl bg-surface p-4 transition-transform hover:-translate-y-0.5"
              >
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ background: categoryHue(pool.category) }}
                />
                <span className="min-w-0 flex-1">
                  <span className="font-display block truncate font-black">
                    {pool.product}
                  </span>
                  <span className="block truncate text-sm text-muted">
                    {pool.place} &middot; {unitPhrase(pool.total_quantity, pool.unit_label)} from{" "}
                    {peoplePhrase(pool.people_count)}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span
                    className="block text-xs font-black"
                    style={{ color: state === "closed" ? "var(--muted)" : "var(--accent)" }}
                  >
                    {STATE_LABEL[state]}
                  </span>
                  {closing && (
                    <span
                      className="block text-xs font-bold"
                      style={{ color: "var(--coral)" }}
                    >
                      {closing}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
