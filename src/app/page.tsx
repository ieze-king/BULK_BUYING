import Link from "next/link";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { SiteHeader } from "@/components/site-header";
import { PoolField } from "@/components/pool-field";
import { listPools } from "@/lib/pools";
import { peoplePhrase } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [pools, totals] = await Promise.all([
    listPools(40),
    db.execute<{ people: number; pools: number }>(sql`
      SELECT (SELECT COUNT(DISTINCT person_id) FROM pool_members)::int AS people,
             (SELECT COUNT(*) FROM pools)::int AS pools
    `),
  ]);
  const { people = 0, pools: poolCount = 0 } = totals.rows[0] ?? {};

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mesh">
          <div className="mx-auto max-w-6xl px-4 pt-12 pb-10 text-center sm:pt-16">
            <p className="rise inline-flex items-center gap-2 rounded-full border-2 border-foreground/15 bg-surface px-4 py-1.5 text-sm font-bold">
              <span className="size-2 rounded-full" style={{ background: "var(--coral)" }} />
              Bulk buying, together &middot; Lagos first
            </p>

            <h1
              className="rise font-display mx-auto mt-6 max-w-4xl text-[2.4rem] font-black leading-[1.03] text-balance sm:text-6xl"
              style={{ animationDelay: "60ms" }}
            >
              Alone, nobody orders enough.
              <span className="mt-1 block" style={{ color: "var(--accent)" }}>
                Together, we do.
              </span>
            </h1>

            <p
              className="rise mx-auto mt-5 max-w-xl text-lg leading-relaxed sm:text-xl"
              style={{ animationDelay: "120ms" }}
            >
              Join a pool for something you want to buy, or start your own. The bigger a
              pool grows, the better the price we can negotiate for everyone in it.
            </p>

            <div
              className="rise mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
              style={{ animationDelay: "180ms" }}
            >
              <Link
                href="/start"
                className="pop w-full rounded-2xl bg-accent px-8 py-4 text-lg font-bold text-accent-contrast transition-transform hover:-translate-y-1 sm:w-auto"
              >
                Start a pool
              </Link>
              <a
                href="#pools"
                className="pop w-full rounded-2xl px-8 py-4 text-lg font-bold transition-transform hover:-translate-y-1 sm:w-auto"
                style={{ background: "var(--marigold)" }}
              >
                Join a pool
              </a>
            </div>

            {people > 0 && (
              <p className="rise mt-6 font-semibold" style={{ animationDelay: "240ms" }}>
                {peoplePhrase(people)} across {poolCount} pool
                {poolCount === 1 ? "" : "s"} so far.
              </p>
            )}
          </div>
        </div>

        <section id="pools" className="scroll-mt-20 px-4 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 text-center">
              <h2 className="font-display text-3xl font-black sm:text-4xl">
                Pools growing now
              </h2>
              <p className="mt-2">
                Each bubble is a group order. The bigger it is, the more people have
                joined. Tap one to add what you want.
              </p>
            </div>

            <PoolField pools={pools} />

            {pools.length > 0 && (
              <div className="mt-12 text-center">
                <p className="text-lg font-semibold">Not seeing what you buy?</p>
                <Link
                  href="/start"
                  className="pop mt-4 inline-flex rounded-2xl px-7 py-3.5 font-bold transition-transform hover:-translate-y-1"
                  style={{ background: "var(--marigold)" }}
                >
                  Start your own pool
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* How it works, kept short: the bubbles already show the mechanic. */}
        <section className="px-4 pb-20">
          <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-3">
            {[
              { n: "1", hue: "var(--marigold)", t: "Join or start a pool", b: "Say what you want and how many. No account, no payment." },
              { n: "2", hue: "var(--coral)", t: "Bring people in", b: "Share it. Every person who joins makes the order bigger." },
              { n: "3", hue: "var(--accent)", t: "We negotiate, then call", b: "When a pool is big enough we take it to suppliers and come back with a price." },
            ].map((s, i) => (
              <div
                key={s.n}
                className="pop rounded-3xl bg-surface p-6"
                style={{ transform: `rotate(${i === 1 ? 0.6 : i === 0 ? -0.6 : 0.3}deg)` }}
              >
                <span
                  className="font-display grid size-12 place-items-center rounded-2xl border-2 border-foreground text-2xl font-black"
                  style={{ background: s.hue }}
                >
                  {s.n}
                </span>
                <h3 className="font-display mt-4 text-xl font-black">{s.t}</h3>
                <p className="mt-2 leading-relaxed text-muted">{s.b}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
