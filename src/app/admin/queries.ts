import { sql } from "drizzle-orm";
import { db } from "@/db";

/**
 * Analysis lives in SQL, not in dashboard components. At pilot volumes the
 * useful workflow is: read the headline numbers here, then export CSV.
 *
 * Pools are the unit of aggregation now: one pool per product per place, so
 * "142 bags in Ikeja" is a row rather than something to reconstruct.
 */

export type PoolRow = {
  product: string;
  unit_label: string;
  place: string;
  total_quantity: number;
  people_count: number;
  ready_count: number;
  joined_this_week: number;
};

/** Every pool, biggest first. This is the headline table. */
export async function poolTable() {
  const { rows } = await db.execute<PoolRow>(sql`
    SELECT p.name AS product,
           p.unit_label,
           COALESCE(g.name, pl.area_label, s.name) AS place,
           COALESCE(SUM(m.quantity), 0)::int AS total_quantity,
           COUNT(m.id)::int AS people_count,
           COUNT(m.id) FILTER (WHERE m.interested)::int AS ready_count,
           COUNT(m.id) FILTER (WHERE m.joined_at > now() - interval '7 days')::int
             AS joined_this_week
    FROM pools pl
    JOIN products p ON p.id = pl.product_id
    JOIN states s ON s.code = pl.state_code
    LEFT JOIN lgas g ON g.id = pl.lga_id
    LEFT JOIN pool_members m ON m.pool_id = pl.id
    GROUP BY pl.id, p.name, p.unit_label, place
    ORDER BY total_quantity DESC
  `);
  return rows;
}

export type PoolTotals = {
  pools: number;
  people: number;
  ready: number;
  members: number;
  joined_this_week: number;
};

export async function poolTotals() {
  const { rows } = await db.execute<PoolTotals>(sql`
    SELECT (SELECT COUNT(*) FROM pools)::int AS pools,
           (SELECT COUNT(DISTINCT person_id) FROM pool_members)::int AS people,
           (SELECT COUNT(*) FROM pool_members WHERE interested)::int AS ready,
           (SELECT COUNT(*) FROM pool_members)::int AS members,
           (SELECT COUNT(*) FROM pool_members
             WHERE joined_at > now() - interval '7 days')::int AS joined_this_week
  `);
  return rows[0];
}

export type PlaceRow = { place: string; pools: number; people: number; quantity: number };

export async function poolsByPlace() {
  const { rows } = await db.execute<PlaceRow>(sql`
    SELECT COALESCE(g.name, pl.area_label, s.name) AS place,
           COUNT(DISTINCT pl.id)::int AS pools,
           COUNT(DISTINCT m.person_id)::int AS people,
           COALESCE(SUM(m.quantity), 0)::int AS quantity
    FROM pools pl
    JOIN states s ON s.code = pl.state_code
    LEFT JOIN lgas g ON g.id = pl.lga_id
    LEFT JOIN pool_members m ON m.pool_id = pl.id
    GROUP BY place
    ORDER BY quantity DESC
  `);
  return rows;
}

export type Gap = {
  request: string;
  times: number;
  from_search: number;
  last_asked: string;
};

/**
 * What to add to the catalogue next, ranked by how many people asked.
 * Grouped case-insensitively so "Groundnut" and "groundnut" are one row.
 */
export async function catalogueGaps() {
  const { rows } = await db.execute<Gap>(sql`
    SELECT lower(btrim(text)) AS request,
           COUNT(*)::int AS times,
           COUNT(*) FILTER (WHERE search_query IS NOT NULL)::int AS from_search,
           MAX(created_at) AS last_asked
    FROM product_requests
    GROUP BY lower(btrim(text))
    ORDER BY times DESC, last_asked DESC
    LIMIT 50
  `);
  return rows;
}
