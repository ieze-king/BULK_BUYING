import { peoplePhrase } from "@/lib/format";

/**
 * The explainer. Someone arriving from a WhatsApp link has no idea what this
 * is, so the page has to answer four things before it asks for anything:
 * what it is, how it works, whether it is for them, and what it will cost.
 *
 * The one piece of illustration earns its place: it shows the aggregation
 * mechanism, which is the part nobody guesses from a product list. It is
 * labelled as an example so it is never mistaken for live data.
 */

/*
 * Proportions only, no quantities. We do not know any supplier's real minimum
 * order, and putting a number here would read as a claim about actual terms.
 */
const POOL = [
  { who: "A retailer", pct: 20 },
  { who: "A restaurant", pct: 15 },
  { who: "A few households", pct: 12 },
  { who: "A caterer", pct: 8 },
];

const STEPS = [
  {
    n: "01",
    title: "Tell us what you need",
    body: "Pick your items and how many. No account, no payment, takes a minute.",
  },
  {
    n: "02",
    title: "We add everyone up",
    body: "What you want joins everybody else's. Together the order reaches a size suppliers will price differently.",
  },
  {
    n: "03",
    title: "We negotiate, then call you",
    body: "Once the quantity is there we take it to distributors, agree a bulk price, and come back to you with it.",
  },
];

const AUDIENCES = [
  { title: "Households", body: "Buy a small amount at the price normally reserved for a large order." },
  { title: "Businesses", body: "Restaurants, schools, hotels and caterers buying to stock up." },
  { title: "Retailers", body: "Combine with other shops and reach distributor-level pricing." },
  { title: "Suppliers", body: "See aggregated demand and move larger quantities at once." },
];

export function Landing({ totalPeople }: { totalPeople: number }) {
  return (
    <div className="hero-wash">
      <div className="mx-auto max-w-6xl px-4">
        {/* Hero */}
        <section className="pt-12 pb-14 sm:pt-20 sm:pb-20">
          <p className="rise text-sm font-medium tracking-wide text-accent">
            Bulk buying, together &middot; Lagos first
          </p>

          <h1
            className="rise font-display mt-4 max-w-3xl text-[2.1rem] font-extrabold leading-[1.05] text-balance sm:text-6xl"
            style={{ animationDelay: "60ms" }}
          >
            Bulk prices aren&rsquo;t for big buyers.
            <span className="block text-accent">They&rsquo;re for big orders.</span>
          </h1>

          <p
            className="rise mt-5 max-w-xl text-lg leading-relaxed text-muted"
            style={{ animationDelay: "120ms" }}
          >
            You don&rsquo;t need to place a big order on your own to get big-order
            prices. Tell us what you want, we combine it with everyone else, and take
            the whole order to suppliers.
          </p>

          <div
            className="rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "180ms" }}
          >
            <a
              href="#pick"
              className="inline-flex h-13 items-center justify-center rounded-xl bg-accent px-7 py-3.5 font-semibold text-accent-contrast transition-colors hover:bg-accent-hover"
            >
              Start my list
            </a>
            <a
              href="#how"
              className="inline-flex h-13 items-center justify-center rounded-xl border border-border-strong px-7 py-3.5 font-medium transition-colors hover:bg-surface-raised"
            >
              How it works
            </a>
          </div>

          <p
            className="rise mt-6 text-sm text-muted"
            style={{ animationDelay: "240ms" }}
          >
            {totalPeople > 0 ? (
              <>
                <strong className="font-semibold text-foreground">
                  {peoplePhrase(totalPeople)}
                </strong>{" "}
                have already shared what they want to buy.
              </>
            ) : (
              <>
                Free to join. Nothing to pay, and nothing is ordered until you say so.
              </>
            )}
          </p>
        </section>

        {/* The mechanism */}
        <section
          className="rise rounded-2xl border border-border bg-surface p-5 sm:p-7"
          style={{ animationDelay: "300ms", boxShadow: "var(--shadow)" }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-lg font-bold">
              How a bulk order comes together
            </h2>
            <span className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted">
              Example
            </span>
          </div>

          <p className="mt-1.5 text-sm text-muted">
            Suppliers price differently once an order passes a certain size. On their
            own, none of these buyers get near it. Combined, they do.
          </p>

          <div className="mt-5">
            <div className="flex h-11 w-full overflow-hidden rounded-lg border border-border bg-surface-raised">
              {POOL.map((seg, i) => (
                <div
                  key={seg.who}
                  className="fill h-full border-r border-[color:var(--surface)]"
                  style={{
                    width: `${seg.pct}%`,
                    background: `color-mix(in oklab, var(--accent) ${92 - i * 16}%, transparent)`,
                    animationDelay: `${400 + i * 130}ms`,
                  }}
                />
              ))}
              <div
                className="flex flex-1 items-center justify-end pr-3 text-xs font-medium text-muted"
                aria-hidden="true"
              >
                still filling
              </div>
            </div>

            <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {POOL.map((seg, i) => (
                <li key={seg.who} className="flex items-center gap-2.5 text-sm">
                  <span
                    className="size-2.5 shrink-0 rounded-sm"
                    style={{
                      background: `color-mix(in oklab, var(--accent) ${92 - i * 16}%, transparent)`,
                    }}
                  />
                  <span className="text-muted">{seg.who}</span>
                </li>
              ))}
            </ul>

            <p className="mt-4 border-t border-border pt-4 text-sm">
              <strong className="font-semibold">One order, many buyers.</strong>{" "}
              <span className="text-muted">
                Once it is big enough, everyone on it pays the bulk price, including the
                household that only wanted a little.
              </span>
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 py-16 sm:py-20">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">How it works</h2>
          <ol className="mt-7 grid gap-5 sm:grid-cols-3 sm:gap-6">
            {STEPS.map((step) => (
              <li
                key={step.n}
                className="relative rounded-xl border border-border bg-surface p-5"
                style={{ boxShadow: "var(--shadow)" }}
              >
                <span className="font-display block text-sm font-bold tracking-widest text-accent">
                  {step.n}
                </span>
                <h3 className="mt-2.5 font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Who it's for */}
        <section className="pb-16 sm:pb-20">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Who it&rsquo;s for</h2>
          <p className="mt-2 max-w-xl text-muted">
            Anyone who buys in quantity. You do not need a shop or a company. A
            household wanting a small amount counts exactly the same.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCES.map((a) => (
              <div key={a.title} className="rounded-xl border border-border bg-surface p-4">
                <h3 className="font-semibold">{a.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{a.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust */}
        <section className="pb-16 sm:pb-20">
          <div className="rounded-2xl border border-accent bg-accent-soft p-5 sm:p-7">
            <h2 className="font-display text-xl font-bold sm:text-2xl">
              What we will never do
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                {
                  t: "Ask you for money",
                  b: "There is nothing to pay here. No deposit, no fee, no card.",
                },
                {
                  t: "Order anything without you",
                  b: "We come back with a price. You decide then, and you can say no.",
                },
                {
                  t: "Pass on your number",
                  b: "We contact you about this bulk purchase. Nobody else gets it.",
                },
              ].map((item) => (
                <li key={item.t}>
                  <p className="font-semibold">{item.t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{item.b}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
