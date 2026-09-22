import { sql } from "drizzle-orm";
import { db } from "@/db";

/**
 * Social proof shown on the public pages.
 *
 * Counts are suppressed below MIN_TO_SHOW. Early on, "1 person wants this" is
 * worse than silence: it tells a visitor nobody is doing this. Once a product
 * clears the threshold the count starts working in our favour.
 */
export const MIN_TO_SHOW = 3;
export const MIN_TOTAL_TO_SHOW = 10;

export type InterestCounts = {
  /** productId -> number of distinct people who have that product on a list. */
  byProduct: Record<number, number>;
  /** Distinct people who have submitted a list at all. */
  totalPeople: number;
};

export async function getInterestCounts(): Promise<InterestCounts> {
  const [perProduct, totals] = await Promise.all([
    db.execute<{ product_id: number; people: number }>(sql`
      SELECT i.product_id, COUNT(DISTINCT l.id)::int AS people
      FROM demand_list_items i
      JOIN demand_lists l ON l.id = i.list_id
      WHERE l.status = 'submitted' AND l.superseded_at IS NULL
      GROUP BY i.product_id
    `),
    db.execute<{ people: number }>(sql`
      SELECT COUNT(*)::int AS people
      FROM demand_lists
      WHERE status = 'submitted' AND superseded_at IS NULL
    `),
  ]);

  const byProduct: Record<number, number> = {};
  for (const row of perProduct.rows) {
    if (row.people >= MIN_TO_SHOW) byProduct[row.product_id] = row.people;
  }

  return { byProduct, totalPeople: totals.rows[0]?.people ?? 0 };
}
