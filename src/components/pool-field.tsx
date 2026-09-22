import Link from "next/link";
import { Bubble } from "@/components/bubble";
import type { PoolSummary } from "@/lib/pools";

export function PoolField({ pools }: { pools: PoolSummary[] }) {
  if (pools.length === 0) {
    return (
      <div className="pop mx-auto max-w-xl rounded-3xl bg-surface p-8 text-center">
        <h2 className="font-display text-2xl font-black">No pools yet</h2>
        <p className="mt-2">
          Be the first. Start a pool for something you want to buy in bulk, then send it
          to your street, your estate group or your trade association.
        </p>
        <Link
          href="/start"
          className="pop mt-6 inline-flex rounded-2xl bg-accent px-7 py-3.5 font-bold text-accent-contrast transition-transform hover:-translate-y-1"
        >
          Start the first pool
        </Link>
      </div>
    );
  }

  const max = Math.max(...pools.map((p) => p.total_quantity));

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
      {pools.map((pool, i) => (
        <Bubble key={pool.slug} pool={pool} max={max} index={i} />
      ))}
    </div>
  );
}
