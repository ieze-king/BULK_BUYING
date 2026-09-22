import { peoplePhrase } from "@/lib/format";

/**
 * The explainer. Someone arriving from a WhatsApp link has no idea what this
 * is, so the page answers four things before it asks for anything: what it is,
 * how it works, whether it is for them, and what it will cost.
 *
 * The pool diagram earns its place by showing the mechanism, which nobody
 * guesses from a product list. Proportions only, no quantities: we do not know
 * any supplier's real minimum, and a number here would read as a claim about
 * actual terms. It is labelled an example for the same reason.
 */

const POOL = [
  { who: "A retailer", pct: 20, hue: "var(--accent)" },
  { who: "A restaurant", pct: 15, hue: "var(--marigold)" },
  { who: "A few households", pct: 12, hue: "var(--coral)" },
  { who: "A caterer", pct: 8, hue: "var(--indigo)" },
];

const STEPS = [
  {
    n: "1",
    hue: "var(--marigold)",
    title: "Tell us what you need",
    body: "Pick your items and how many. No account, no payment, takes a minute.",
  },
  {
    n: "2",
    hue: "var(--coral)",
    title: "We add everyone up",
    body: "What you want joins everybody else's. Together the order reaches a size suppliers will price differently.",
  },
  {
    n: "3",
    hue: "var(--accent)",
    title: "We negotiate, then call you",
    body: "Once the quantity is there we take it to distributors, agree a bulk price, and come back to you with it.",
  },
];

const AUDIENCES = [
  { title: "Households", body: "Buy a small amount at the price normally reserved for a large order.", hue: "var(--marigold)" },
  { title: "Businesses", body: "Restaurants, schools, hotels and caterers buying to stock up.", hue: "var(--coral)" },
  { title: "Retailers", body: "Combine with other shops and reach distributor-level pricing.", hue: "var(--indigo)" },
  { title: "Suppliers", body: "See aggregated demand and move larger quantities at once.", hue: "var(--sky)" },
];

const NEVER = [
  { t: "Ask you for money", b: "There is nothing to pay here. No deposit, no fee, no card." },
  { t: "Order anything without you", b: "We come back with a price. You decide then, and you can say no." },
  { t: "Pass on your number", b: "We contact you about this bulk purchase. Nobody else gets it." },
];

export function Landing({
  totalPeople,
  marquee,
}: {
  totalPeople: number;
  /** Real catalogue names, scrolled to show breadth at a glance. */
  marquee: string[];
}) {
  const ticker = [...marquee, ...marquee];

  return (
    <div>
      {/* Hero */}
      <div className="mesh">
        <div className="mx-auto max-w-6xl px-4 pt-14 pb-16 sm:pt-20 sm:pb-20">
          <p className="rise inline-flex items-center gap-2 rounded-full border-2 border-foreground/15 bg-surface px-4 py-1.5 text-sm font-bold">
            <span className="size-2 rounded-full" style={{ background: "var(--coral)" }} />
            Bulk buying, together &middot; Lagos first
          </p>

          <h1
            className="rise font-display mt-6 max-w-4xl text-[2.6rem] font-black leading-[1.02] text-balance sm:text-7xl"
            style={{ animationDelay: "60ms" }}
          >
            Bulk prices aren&rsquo;t for{" "}
            <span className="marker">big buyers</span>.
            <span className="mt-1 block" style={{ color: "var(--accent)" }}>
              They&rsquo;re for big orders.
            </span>
          </h1>

          <p
            className="rise mt-6 max-w-xl text-lg leading-relaxed sm:text-xl"
            style={{ animationDelay: "120ms" }}
          >
            You don&rsquo;t need to place a big order on your own to get big-order
            prices. Tell us what you want, we combine it with everyone else, and take
            the whole order to suppliers.
          </p>

          <div
            className="rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "180ms" }}
          >
            <a
              href="#pick"
              className="pop inline-flex items-center justify-center rounded-2xl bg-accent px-8 py-4 text-lg font-bold text-accent-contrast transition-transform hover:-translate-y-1"
            >
              Start my list
            </a>
            <a
              href="#how"
              className="inline-flex items-center justify-center rounded-2xl border-2 border-foreground/20 bg-surface px-8 py-4 text-lg font-bold transition-transform hover:-translate-y-1"
            >
              How it works
            </a>
          </div>

          <p className="rise mt-6 text-sm font-medium" style={{ animationDelay: "240ms" }}>
            {totalPeople > 0 ? (
              <>
                <span className="font-display text-xl font-black">
                  {peoplePhrase(totalPeople)}
                </span>{" "}
                have already shared what they want to buy.
              </>
            ) : (
              <>Free to join. Nothing to pay, and nothing is ordered until you say so.</>
            )}
          </p>
        </div>
      </div>

      {/* Breadth, at a glance */}
      <div className="overflow-hidden border-y-2 border-foreground/10 bg-surface py-3.5">
        <div className="marquee" aria-hidden="true">
          {ticker.map((name, i) => (
            <span key={i} className="flex items-center whitespace-nowrap px-4 text-sm font-bold">
              {name}
              <span className="ml-8 size-1.5 rounded-full" style={{ background: "var(--coral)" }} />
            </span>
          ))}
        </div>
        <span className="sr-only">
          The catalogue covers food, drinks, household goods, personal care and building
          materials.
        </span>
      </div>

      <div className="mx-auto max-w-6xl px-4">
        {/* The mechanism */}
        <section className="pop mt-14 rounded-3xl bg-surface p-5 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-display text-2xl font-black sm:text-3xl">
              How a bulk order comes together
            </h2>
            <span
              className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
              style={{ background: "var(--marigold)", color: "var(--foreground)" }}
            >
              Example
            </span>
          </div>

          <p className="mt-2 max-w-2xl">
            Suppliers price differently once an order passes a certain size. On their
            own, none of these buyers get near it. Combined, they do.
          </p>

          <div className="mt-6">
            <div className="weave flex h-14 w-full overflow-hidden rounded-2xl border-2 border-foreground">
              {POOL.map((seg, i) => (
                <div
                  key={seg.who}
                  className="fill h-full border-r-2 border-foreground"
                  style={{
                    width: `${seg.pct}%`,
                    background: seg.hue,
                    animationDelay: `${350 + i * 140}ms`,
                  }}
                />
              ))}
              <div className="flex flex-1 items-center justify-end pr-4 text-sm font-bold text-muted">
                still filling
              </div>
            </div>

            <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {POOL.map((seg) => (
                <li key={seg.who} className="flex items-center gap-3 font-medium">
                  <span
                    className="size-4 shrink-0 rounded-md border-2 border-foreground"
                    style={{ background: seg.hue }}
                  />
                  {seg.who}
                </li>
              ))}
            </ul>

            <p className="mt-6 border-t-2 border-foreground/10 pt-5 text-lg">
              <strong className="font-display font-black">One order, many buyers.</strong>{" "}
              Once it is big enough, everyone on it pays the bulk price, including the
              household that only wanted a little.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 py-16 sm:py-24">
          <h2 className="font-display text-3xl font-black sm:text-5xl">How it works</h2>
          <ol className="mt-9 grid gap-5 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li
                key={step.n}
                className="pop rounded-3xl bg-surface p-6 transition-transform hover:-translate-y-1"
                style={{ transform: `rotate(${i === 1 ? 0.7 : i === 0 ? -0.7 : 0.4}deg)` }}
              >
                <span
                  className="font-display grid size-12 place-items-center rounded-2xl border-2 border-foreground text-2xl font-black"
                  style={{ background: step.hue }}
                >
                  {step.n}
                </span>
                <h3 className="font-display mt-4 text-xl font-black">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Who it's for */}
        <section className="pb-16 sm:pb-24">
          <h2 className="font-display text-3xl font-black sm:text-5xl">
            Who it&rsquo;s for
          </h2>
          <p className="mt-3 max-w-xl text-lg">
            Anyone who buys in quantity. You do not need a shop or a company. A
            household wanting a small amount counts exactly the same.
          </p>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCES.map((a) => (
              <div
                key={a.title}
                className="rounded-3xl border-2 border-foreground/12 p-5 transition-transform hover:-translate-y-1"
                style={{ background: `color-mix(in oklab, ${a.hue} 16%, var(--surface))` }}
              >
                <span
                  className="block size-5 rounded-lg border-2 border-foreground"
                  style={{ background: a.hue }}
                />
                <h3 className="font-display mt-4 text-xl font-black">{a.title}</h3>
                <p className="mt-1.5 leading-relaxed">{a.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust */}
        <section className="pb-16 sm:pb-24">
          <div
            className="pop rounded-3xl p-6 sm:p-9"
            style={{ background: "var(--accent)", color: "var(--accent-contrast)" }}
          >
            <h2 className="font-display text-2xl font-black sm:text-4xl">
              What we will never do
            </h2>
            <ul className="mt-7 grid gap-6 sm:grid-cols-3">
              {NEVER.map((item) => (
                <li key={item.t}>
                  <p className="font-display text-lg font-black">{item.t}</p>
                  <p className="mt-1.5 leading-relaxed opacity-90">{item.b}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
