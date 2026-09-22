import Link from "next/link";
import { Bubble } from "@/components/bubble";
import { categoryHue, categoryTint } from "@/lib/category-style";
import type { PoolSummary, Starter } from "@/lib/pools";

/** An invitation, not demand: no quantity, because nobody has joined yet. */
function StarterBubble({
  starter,
  index,
  size,
}: {
  starter: Starter;
  index: number;
  size: number;
}) {
  return (
    <Link
      href={`/start?product=${starter.productId}`}
      className="rise grid shrink-0 place-items-center rounded-full border-2 border-dashed border-foreground/40 p-3 text-center transition-transform hover:-translate-y-1.5 hover:border-solid hover:border-foreground"
      style={{
        width: size,
        height: size,
        background: categoryTint(starter.category, 16),
        animationDelay: `${Math.min(index * 60, 600)}ms`,
      }}
    >
      <span>
        <span className="font-display block text-sm font-black leading-tight">
          {starter.product}
        </span>
        <span
          className="mt-1.5 block text-xs font-bold"
          style={{ color: categoryHue(starter.category) }}
        >
          Be the first
        </span>
      </span>
    </Link>
  );
}

export function PoolField({
  pools,
  starters = [],
}: {
  pools: PoolSummary[];
  starters?: Starter[];
}) {
  const max = pools.length > 0 ? Math.max(...pools.map((p) => p.total_quantity)) : 0;
  // All starters are the same size, because none of them has any demand yet.
  // Making some bigger would be inventing a difference that does not exist.
  const starterSize = pools.length === 0 ? 150 : 118;

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        {pools.map((pool, i) => (
          <Bubble key={pool.slug} pool={pool} max={max} index={i} />
        ))}
        {starters.map((s, i) => (
          <StarterBubble
            key={s.productId}
            starter={s}
            index={pools.length + i}
            size={starterSize}
          />
        ))}
      </div>

      {pools.length === 0 && starters.length === 0 && (
        <p className="mx-auto mt-8 max-w-md text-center text-lg">
          Nothing to show yet.{" "}
          <Link href="/start" className="font-bold underline underline-offset-4">
            Start the first pool
          </Link>
          .
        </p>
      )}
    </>
  );
}
