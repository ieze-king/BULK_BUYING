import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { categoryHue, categoryTint } from "@/lib/category-style";
import { peoplePhrase, unitPhrase } from "@/lib/format";
import { getMembers, getPool } from "@/lib/pools";
import { JoinForm } from "./join-form";
import { SharePool } from "./share-pool";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  household: "A household",
  business: "A business",
  retail: "A shop",
  other: "Someone",
};

export default async function PoolPage({
  params,
  searchParams,
}: PageProps<"/pool/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const pool = await getPool(slug);
  if (!pool) notFound();

  const members = await getMembers(slug);
  const justJoined = sp.joined === "1";
  const justCreated = sp.new === "1";
  const hue = categoryHue(pool.category);

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

          {justJoined && (
            <div
              className="pop mt-5 rounded-2xl px-5 py-4"
              style={{ background: "var(--accent)", color: "var(--accent-contrast)" }}
            >
              <p className="font-display text-lg font-black">
                {justCreated ? "Your pool is live." : "You are in."}
              </p>
              <p className="mt-1 opacity-90">
                {justCreated
                  ? "Now send it to people who buy the same thing. A pool only works when it grows."
                  : "The bigger this pool gets, the better the price we can negotiate."}
              </p>
            </div>
          )}

          {/* The bubble */}
          <div className="mt-8 grid place-items-center">
            <div
              className="grid aspect-square w-[min(72vw,270px)] place-items-center rounded-full border-2 border-foreground p-6 text-center"
              style={{ background: categoryTint(pool.category, 38), boxShadow: `7px 7px 0 0 ${hue}` }}
            >
              <div>
                <p className="font-display text-4xl font-black leading-none">
                  {pool.total_quantity}
                </p>
                <p className="font-display text-lg font-black leading-tight">
                  {pool.unit_label}
                  {pool.total_quantity === 1 ? "" : "s"}
                </p>
                <p className="mt-2 text-sm font-semibold opacity-75">
                  from {peoplePhrase(pool.people_count)}
                </p>
              </div>
            </div>
          </div>

          <h1 className="font-display mt-7 text-center text-3xl font-black sm:text-4xl">
            {pool.product}
          </h1>
          <p className="mt-1 text-center text-lg font-semibold text-muted">{pool.place}</p>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            {[
              { label: "People in", value: String(pool.people_count) },
              { label: "Ready to buy", value: String(pool.ready_count) },
              { label: "Joined this week", value: String(pool.joined_this_week) },
            ].map((stat) => (
              <div key={stat.label} className="pop rounded-2xl bg-surface px-2 py-3">
                <p className="font-display text-2xl font-black">{stat.value}</p>
                <p className="text-xs font-semibold text-muted">{stat.label}</p>
              </div>
            ))}
          </div>

          <p className="mt-5 text-center">
            There is no target to hit. The bigger this pool gets, the better the price we
            can negotiate for everyone in it.
          </p>

          <SharePool slug={slug} product={pool.product} place={pool.place} />

          <JoinForm slug={slug} product={pool.product} unitLabel={pool.unit_label} />

          {members.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-xl font-black">Who is in</h2>
              <ul className="mt-3 divide-y-2 divide-foreground/10">
                {members.map((m, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="font-medium">
                      {ROLE_LABEL[m.participant_type ?? "other"] ?? "Someone"}
                      {m.interested && (
                        <span
                          className="ml-2 rounded-full px-2 py-0.5 text-xs font-bold"
                          style={{ background: "var(--marigold)" }}
                        >
                          ready to buy
                        </span>
                      )}
                    </span>
                    <span className="font-display shrink-0 font-black tabular-nums">
                      {unitPhrase(m.quantity, pool.unit_label)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-muted">
                Names and numbers are never shown here.
              </p>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
