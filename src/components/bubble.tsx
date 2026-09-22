import Link from "next/link";
import { categoryHue, categoryTint } from "@/lib/category-style";
import { peoplePhrase, unitPhrase } from "@/lib/format";
import type { PoolSummary } from "@/lib/pools";

/**
 * A pool, drawn as a bubble whose size is its demand.
 *
 * Size is the entire point: the aggregation mechanic becomes visible instead
 * of something a diagram has to explain. Scaling is by square root so area,
 * not diameter, tracks quantity, which is how people actually read circles.
 * Everything the size conveys is also written inside it, so the sizing is
 * decoration over text rather than the only carrier of meaning.
 */
export function Bubble({
  pool,
  max,
  index = 0,
}: {
  pool: PoolSummary;
  /** Largest quantity in the field, so bubbles scale relative to each other. */
  max: number;
  index?: number;
}) {
  const ratio = max > 0 ? Math.sqrt(pool.total_quantity / max) : 0;
  const size = Math.round(120 + ratio * 120); // 120px to 240px
  const hue = categoryHue(pool.category);

  return (
    <Link
      href={`/pool/${pool.slug}`}
      className="rise group grid shrink-0 place-items-center rounded-full border-2 border-foreground p-4 text-center transition-transform hover:-translate-y-1.5 focus-visible:outline-2 focus-visible:outline-offset-4"
      style={{
        width: size,
        height: size,
        background: categoryTint(pool.category, 38),
        boxShadow: `5px 5px 0 0 ${hue}`,
        animationDelay: `${Math.min(index * 60, 600)}ms`,
      }}
    >
      <span className="px-1">
        <span className="font-display block text-[0.95rem] font-black leading-tight">
          {pool.product}
        </span>
        <span className="mt-0.5 block text-xs font-semibold opacity-70">{pool.place}</span>
        <span className="font-display mt-1.5 block text-xl font-black leading-none">
          {unitPhrase(pool.total_quantity, pool.unit_label)}
        </span>
        <span className="mt-1 block text-xs font-semibold opacity-70">
          {peoplePhrase(pool.people_count)}
        </span>
      </span>
    </Link>
  );
}
